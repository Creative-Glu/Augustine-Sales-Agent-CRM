import { executionSupabase } from '@/lib/executionSupabaseClient';
import { Institution } from '@/types/execution';

export interface InstitutionPaginatedParams {
  offset: number;
  limit: number;
}

export interface InstitutionPaginatedResponse {
  data: Institution[];
  total: number;
  hasMore: boolean;
}

export async function getInstitutionPaginated({
  offset,
  limit,
}: InstitutionPaginatedParams): Promise<InstitutionPaginatedResponse> {
  const { data, error, count } = await executionSupabase
    .from('institutions')
    .select('*', { count: 'exact', head: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

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
