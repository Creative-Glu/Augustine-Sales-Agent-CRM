import { supabase } from '@/lib/supabaseClient';
import { Journey } from '@/types/Journey';

const LEAD_TABLE = 'Augustine 10';
const JOURNEY_SELECT = '*, campaigns(*), lead:lead_id!inner(*)';

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

export async function getJourneys(filters: JourneyFilters = {}): Promise<Journey[]> {
  try {
    let query = supabase.from('journeys').select(JOURNEY_SELECT);
    query = applyFilters(query, filters);

    const { data, error } = await query.order('last_interaction', { ascending: false });

    if (error) throw new Error(`Error fetching journeys: ${error.message}`);
    return (data ?? []) as unknown as Journey[];
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
    let query = supabase.from('journeys').select(JOURNEY_SELECT, { count: 'exact' });
    query = applyFilters(query, filters);

    const { data, count, error } = await query
      .order('last_interaction', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Error fetching paginated journeys: ${error.message}`);

    const total = count ?? 0;
    return {
      journeys: (data ?? []) as unknown as Journey[],
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('getJourneysPaginated failed');
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
