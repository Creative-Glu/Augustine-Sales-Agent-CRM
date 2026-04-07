import { executionSupabase } from '@/lib/executionSupabaseClient';
import { Job } from '@/types/execution';

export type JobStatusFilter = 'all' | 'pending' | 'running' | 'completed' | 'failed';

export interface JobsPaginatedParams {
  offset: number;
  limit: number;
  status?: JobStatusFilter;
}

export interface JobsPaginatedResponse {
  data: Job[];
  total: number;
  hasMore: boolean;
}

export async function getJobsPaginated({
  offset,
  limit,
  status = 'all',
}: JobsPaginatedParams): Promise<JobsPaginatedResponse> {
  let query = executionSupabase
    .from('jobs')
    .select('*', { count: 'exact', head: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  query = query.order('updated_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Error fetching jobs: ${error.message}`);

  const total = count ?? 0;
  const hasMore = offset + (data?.length ?? 0) < total;

  return {
    data: (data ?? []) as Job[],
    total,
    hasMore,
  };
}
