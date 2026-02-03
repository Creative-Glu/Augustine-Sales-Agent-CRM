import { executionSupabase } from '@/lib/executionSupabaseClient';
import { Staff } from '@/types/execution';

export interface StaffPaginatedParams {
  offset: number;
  limit: number;
  result_id?: string;
  name_search?: string;
  email_search?: string;
}

export interface StaffPaginatedResponse {
  data: Staff[];
  total: number;
  hasMore: boolean;
}

export async function getStaffPaginated({
  offset,
  limit,
  result_id,
  name_search,
  email_search,
}: StaffPaginatedParams): Promise<StaffPaginatedResponse> {
  let query = executionSupabase
    .from('staff')
    .select('*', { count: 'exact', head: false });

  if (result_id) query = query.eq('result_id', result_id);
  if (name_search?.trim()) query = query.ilike('name', `%${name_search.trim()}%`);
  if (email_search?.trim()) query = query.ilike('email', `%${email_search.trim()}%`);

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Error fetching staff: ${error.message}`);

  const total = count ?? 0;
  const hasMore = offset + (data?.length ?? 0) < total;

  return {
    data: (data ?? []) as Staff[],
    total,
    hasMore,
  };
}
