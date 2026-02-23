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

/** Count of institution records created in the last 24 hours. */
export async function getInstitutionCountLast24h(): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await executionSupabase
    .from('institutions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since);

  if (error) throw new Error(`Error fetching institution count (24h): ${error.message}`);
  return count ?? 0;
}
