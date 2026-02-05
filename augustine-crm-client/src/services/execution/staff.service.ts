import { executionSupabase } from '@/lib/executionSupabaseClient';
import { Staff } from '@/types/execution';

export interface StaffPaginatedParams {
  offset: number;
  limit: number;
  name_search?: string;
  email_search?: string;
  date_from?: string; // ISO date YYYY-MM-DD
  date_to?: string;   // ISO date YYYY-MM-DD
}

export interface StaffPaginatedResponse {
  data: Staff[];
  total: number;
  hasMore: boolean;
}

const EXPORT_MAX_ROWS = 10000;

export async function getStaffPaginated({
  offset,
  limit,
  name_search,
  email_search,
  date_from,
  date_to,
}: StaffPaginatedParams): Promise<StaffPaginatedResponse> {
  let query = executionSupabase
    .from('staff')
    .select('*', { count: 'exact', head: false });

  if (name_search?.trim()) query = query.ilike('name', `%${name_search.trim()}%`);
  if (email_search?.trim()) query = query.ilike('email', `%${email_search.trim()}%`);
  if (date_from) {
    const fromStart = new Date(date_from);
    fromStart.setUTCHours(0, 0, 0, 0);
    query = query.gte('created_at', fromStart.toISOString());
  }
  if (date_to) {
    const toEnd = new Date(date_to);
    toEnd.setUTCHours(23, 59, 59, 999);
    query = query.lte('created_at', toEnd.toISOString());
  }

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

export interface StaffExportParams {
  result_id?: string;
  name_search?: string;
  email_search?: string;
  date_from?: string;
  date_to?: string;
}

export async function getStaffForExport(params: StaffExportParams): Promise<Staff[]> {
  let query = executionSupabase
    .from('staff')
    .select('*');

  const { result_id, name_search, email_search, date_from, date_to } = params;
  if (result_id) query = query.eq('result_id', result_id);
  if (name_search?.trim()) query = query.ilike('name', `%${name_search.trim()}%`);
  if (email_search?.trim()) query = query.ilike('email', `%${email_search.trim()}%`);
  if (date_from) {
    const fromStart = new Date(date_from);
    fromStart.setUTCHours(0, 0, 0, 0);
    query = query.gte('created_at', fromStart.toISOString());
  }
  if (date_to) {
    const toEnd = new Date(date_to);
    toEnd.setUTCHours(23, 59, 59, 999);
    query = query.lte('created_at', toEnd.toISOString());
  }

  query = query.order('created_at', { ascending: false }).limit(EXPORT_MAX_ROWS);

  const { data, error } = await query;

  if (error) throw new Error(`Error fetching staff for export: ${error.message}`);
  return (data ?? []) as Staff[];
}

export async function getStaffByInstitutionId(institution_id: number | string): Promise<Staff[]> {
  const raw = institution_id;
  if (raw === undefined || raw === null) return [];

  const { data, error } = await executionSupabase
    .from('staff')
    .select('*')
    .eq('institution_id', raw)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error fetching staff by institution: ${error.message}`);
  return (data ?? []) as Staff[];
}
