import { executionSupabase } from '@/lib/executionSupabaseClient';
import { Institution } from '@/types/execution';
import type { SyncStatus } from '@/types/execution';

export interface InstitutionPaginatedParams {
  offset: number;
  limit: number;
  is_eligible?: boolean | null;
  synced_to_hubspot?: boolean | null;
  sync_status?: SyncStatus | null;
  /** Min confidence in percentage 0–100 (UI). Stored in DB as 0–1, so we map before query. */
  confidence_min?: number | null;
  /** Max confidence in percentage 0–100 (UI). Stored in DB as 0–1, so we map before query. */
  confidence_max?: number | null;
}

export interface InstitutionPaginatedResponse {
  data: Institution[];
  total: number;
  hasMore: boolean;
}

export async function getInstitutionPaginated({
  offset,
  limit,
  is_eligible,
  synced_to_hubspot,
  sync_status,
  confidence_min,
  confidence_max,
}: InstitutionPaginatedParams): Promise<InstitutionPaginatedResponse> {
  let query = executionSupabase
    .from('institutions')
    .select('*', { count: 'exact', head: false })
    .order('created_at', { ascending: false });

  if (is_eligible != null) query = query.eq('is_eligible', is_eligible);
  if (synced_to_hubspot != null) query = query.eq('synced_to_hubspot', synced_to_hubspot);
  if (sync_status != null) query = query.eq('sync_status', sync_status);
  // DB stores enrichment_confidence as 0–1; filters are in % (0–100)
  if (confidence_min != null) {
    const minDecimal = Math.min(1, Math.max(0, Number(confidence_min) / 100));
    query = query.gte('enrichment_confidence', minDecimal);
  }
  if (confidence_max != null) {
    const maxDecimal = Math.min(1, Math.max(0, Number(confidence_max) / 100));
    query = query.lte('enrichment_confidence', maxDecimal);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) throw new Error(`Error fetching institution: ${error.message}`);

  const total = count ?? 0;
  const hasMore = offset + (data?.length ?? 0) < total;

  return {
    data: (data ?? []) as Institution[],
    total,
    hasMore,
  };
}

/** Fetch a single institution by id (for modal / detail). */
export async function getInstitutionById(id: number | string): Promise<Institution | null> {
  const { data, error } = await executionSupabase
    .from('institutions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Error fetching institution: ${error.message}`);
  return data as Institution | null;
}

export interface InstitutionCounts {
  total: number;
  withEmail: number;
  withoutEmail: number;
}

/** Count institutions with optional 24h filter; includes with/without email breakdown. */
export async function getInstitutionCounts(last24h: boolean): Promise<InstitutionCounts> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let totalQuery = executionSupabase.from('institutions').select('*', { count: 'exact', head: true });
  if (last24h) totalQuery = totalQuery.gte('created_at', since);
  const { count: total, error: totalError } = await totalQuery;
  if (totalError) throw new Error(`Error fetching institution count: ${totalError.message}`);

  let withEmailQuery = executionSupabase
    .from('institutions')
    .select('*', { count: 'exact', head: true })
    .not('email', 'is', null)
    .neq('email', '');
  if (last24h) withEmailQuery = withEmailQuery.gte('created_at', since);
  const { count: withEmail, error: withEmailError } = await withEmailQuery;
  if (withEmailError) throw new Error(`Error fetching institution with-email count: ${withEmailError.message}`);

  return {
    total: total ?? 0,
    withEmail: withEmail ?? 0,
    withoutEmail: (total ?? 0) - (withEmail ?? 0),
  };
}
