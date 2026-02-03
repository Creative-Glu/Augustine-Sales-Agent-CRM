import { executionSupabase } from '@/lib/executionSupabaseClient';
import { Result } from '@/types/execution';

export type ResultStatusFilter = 'all' | 'success' | 'error';
export type ResultSourceFilter = 'all' | 'pdf' | 'web' | 'error';

export interface ResultsPaginatedParams {
  offset: number;
  limit: number;
  job_id?: string;
  status?: ResultStatusFilter;
  source?: ResultSourceFilter;
}

export interface ResultsPaginatedResponse {
  data: Result[];
  total: number;
  hasMore: boolean;
}

export async function getResultsPaginated({
  offset,
  limit,
  job_id,
  status = 'all',
  source = 'all',
}: ResultsPaginatedParams): Promise<ResultsPaginatedResponse> {
  let query = executionSupabase
    .from('results')
    .select('*', { count: 'exact', head: false });

  if (job_id) query = query.eq('job_id', job_id);
  if (status !== 'all') query = query.eq('status', status);
  if (source !== 'all') query = query.eq('source', source);

  query = query.order('processed_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Error fetching results: ${error.message}`);

  const total = count ?? 0;
  const hasMore = offset + (data?.length ?? 0) < total;

  return {
    data: (data ?? []) as Result[],
    total,
    hasMore,
  };
}
