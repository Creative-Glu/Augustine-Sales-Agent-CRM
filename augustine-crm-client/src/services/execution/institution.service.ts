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
