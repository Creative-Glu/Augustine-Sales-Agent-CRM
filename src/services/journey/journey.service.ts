import { supabase } from '@/lib/supabaseClient';
import { Journey } from '@/types/Journey';

const LEAD_TABLE = 'Augustine 10';
// LEFT JOIN (no `!inner`) so journeys with a missing/orphaned lead reference
// still appear in the list — they'll have `lead: null` in the payload. The
// alternative (`!inner`) silently dropped these rows, making the journey
// count smaller than `select count(*) from journeys`.
const JOURNEY_SELECT = '*, campaigns(*), lead:lead_id(*)';

export interface JourneyFilters {
  search?: string;
  stage?: string;
  campaignId?: string;
  institutionType?: string;
  dateFromIso?: string;
}

export interface JourneysResponse {
  journeys: Journey[];
  total: number;
  hasMore: boolean;
}

type SupabaseSelectQuery = ReturnType<ReturnType<typeof supabase.from>['select']>;

function applyFilters(query: SupabaseSelectQuery, filters: JourneyFilters): SupabaseSelectQuery {
  let q = query;

  if (filters.stage && filters.stage !== 'all') {
    q = q.eq('funnel_stage', filters.stage);
  }
  if (filters.campaignId && filters.campaignId !== 'all') {
    q = q.eq('campaign_id', filters.campaignId);
  }
  if (filters.dateFromIso) {
    q = q.gte('last_interaction', filters.dateFromIso);
  }
  if (filters.institutionType && filters.institutionType !== 'all') {
    q = q.eq(`${LEAD_TABLE}.Institution Type`, filters.institutionType);
  }
  if (filters.search?.trim()) {
    const term = filters.search.trim().replace(/[%,]/g, '');
    const pattern = `*${term}*`;
    q = q.or(
      [
        `"Parish Name".ilike.${pattern}`,
        `"Diocese/Archdiocese Name".ilike.${pattern}`,
        `"Parish Contact Email".ilike.${pattern}`,
        `"Parish Phone".ilike.${pattern}`,
      ].join(','),
      { referencedTable: LEAD_TABLE }
    );
  }

  return q;
}

/**
 * The PostgREST embed `lead:lead_id!inner(*)` translates to a SQL JOIN, which
 * means if the leads table (Augustine 10) has duplicate `id` values, a single
 * journey row gets multiplied — one row per matching lead. We dedupe by
 * `journey_id` here as a defensive safeguard so the UI always reflects the
 * true journey count (which is what `select count(*) from journeys` returns).
 *
 * The real fix is to add a UNIQUE constraint on `Augustine 10.id` (it should
 * be the primary key). Until that's done in the DB, this dedupe keeps the
 * journey page consistent with the dashboard.
 */
function dedupeByJourneyId(rows: { journey_id: string }[]): Journey[] {
  const seen = new Set<string>();
  const out: Journey[] = [];
  for (const row of rows) {
    if (!row?.journey_id || seen.has(row.journey_id)) continue;
    seen.add(row.journey_id);
    out.push(row as unknown as Journey);
  }
  return out;
}

export async function getJourneys(filters: JourneyFilters = {}): Promise<Journey[]> {
  try {
    let query = supabase.from('journeys').select(JOURNEY_SELECT);
    query = applyFilters(query, filters);

    const { data, error } = await query.order('last_interaction', { ascending: false });

    if (error) throw new Error(`Error fetching journeys: ${error.message}`);
    return dedupeByJourneyId((data ?? []) as { journey_id: string }[]);
  } catch (error) {
    throw error instanceof Error ? error : new Error('getJourneys failed');
  }
}

export async function getJourneysPaginated(
  offset: number = 0,
  limit: number = 10,
  filters: JourneyFilters = {}
): Promise<JourneysResponse> {
  try {
    // For the count we run a separate plain count query on `journeys` so the
    // total reflects actual journey rows, not joined+duplicated rows.
    let countQuery = supabase.from('journeys').select('journey_id', {
      count: 'exact',
      head: true,
    });
    countQuery = applyFilters(countQuery, filters);

    let dataQuery = supabase.from('journeys').select(JOURNEY_SELECT);
    dataQuery = applyFilters(dataQuery, filters);

    // Over-fetch by 2x to give dedupe headroom when the JOIN inflates rows.
    // Worst case: every lead has 1 duplicate → fetch 2*limit, dedupe to limit.
    const fetchUpperBound = offset + limit * 2;

    const [countResult, dataResult] = await Promise.all([
      countQuery,
      dataQuery
        .order('last_interaction', { ascending: false })
        .range(offset, fetchUpperBound - 1),
    ]);

    if (dataResult.error) {
      throw new Error(`Error fetching paginated journeys: ${dataResult.error.message}`);
    }

    const deduped = dedupeByJourneyId(
      (dataResult.data ?? []) as { journey_id: string }[]
    );
    const pageRows = deduped.slice(0, limit);
    const total = countResult.error ? deduped.length : (countResult.count ?? deduped.length);

    return {
      journeys: pageRows,
      total,
      hasMore: offset + pageRows.length < total,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('getJourneysPaginated failed');
  }
}

export type ClosedOutcome = 'Closed-Won' | 'Closed-Lost';

export interface MarkClosedOptions {
  /** Optional free-text note to append to the log entry. */
  note?: string;
  /** For Closed-Lost only — short reason category (used to prefix the log). */
  lostReason?: string;
}

/**
 * Manually mark a journey as Closed-Won or Closed-Lost. Updates the journey's
 * funnel_stage + last_interaction in one statement, then writes a log entry
 * describing the manual transition (so the Activity Logs tab and any audit
 * trail captures who/why).
 *
 * Log insertion is best-effort — if it fails the stage change still sticks.
 */
export async function markJourneyClosed(
  journeyId: string,
  outcome: ClosedOutcome,
  options?: MarkClosedOptions
): Promise<void> {
  try {
    const nowIso = new Date().toISOString();

    // Build the descriptive note ONCE — written to journeys.notes so that the
    // existing DB trigger (which auto-logs on journeys.UPDATE by copying the
    // current notes column into logs) picks it up correctly. Otherwise the
    // trigger would re-log the stale "Lead clicked booking link" text from
    // the previous SAL transition, producing a duplicate log entry.
    const parts: string[] = [];
    parts.push(
      outcome === 'Closed-Won'
        ? 'Journey manually marked as Closed-Won.'
        : 'Journey manually marked as Closed-Lost.'
    );
    if (options?.lostReason?.trim()) {
      parts.push(`Reason: ${options.lostReason.trim()}`);
    }
    if (options?.note?.trim()) {
      parts.push(`Note: ${options.note.trim()}`);
    }
    const closureNote = parts.join(' ');

    const { data: updated, error: updateError } = await supabase
      .from('journeys')
      .update({
        funnel_stage: outcome,
        last_interaction: nowIso,
        notes: closureNote,
      })
      .eq('journey_id', journeyId)
      .select('journey_id, lead_id, funnel_stage')
      .single();

    if (updateError) {
      throw new Error(`Error updating journey: ${updateError.message}`);
    }
    if (!updated) {
      throw new Error('Journey not found or could not be updated.');
    }

    // NOTE: we intentionally do NOT manually insert into `logs` here.
    // The DB trigger on journeys.UPDATE writes a log row using the new
    // notes value we just set above. A manual insert would create a
    // duplicate entry with identical text at the same timestamp.
  } catch (error) {
    throw error instanceof Error ? error : new Error('markJourneyClosed failed');
  }
}

export async function deleteJourney(journeyId: string): Promise<void> {
  try {
    // Delete dependent log rows first to avoid the FK constraint
    // `logs_journey_id_fkey`. Long-term fix: add ON DELETE CASCADE to the FK,
    // or wrap both deletes in a Postgres RPC so they're atomic.
    const { error: logsError } = await supabase
      .from('logs')
      .delete()
      .eq('journey_id', journeyId);

    if (logsError) {
      throw new Error(`Error deleting journey logs: ${logsError.message}`);
    }

    const { error } = await supabase
      .from('journeys')
      .delete()
      .eq('journey_id', journeyId);

    if (error) throw new Error(`Error deleting journey: ${error.message}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('deleteJourney failed');
  }
}
