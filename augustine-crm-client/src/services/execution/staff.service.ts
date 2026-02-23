import { executionSupabase } from '@/lib/executionSupabaseClient';
import { Staff } from '@/types/execution';

export interface StaffPaginatedParams {
  offset: number;
  limit: number;
  name_search?: string;
  email_search?: string;
  date_from?: string; // ISO date YYYY-MM-DD
  date_to?: string;   // ISO date YYYY-MM-DD
  /** When true, only return staff that meet enrichment target: name, role, email, contact_number, institution_id all present */
  enriched_only?: boolean;
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
  enriched_only,
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

  if (enriched_only) {
    query = query
      .not('name', 'is', null)
      .neq('name', '')
      .not('role', 'is', null)
      .neq('role', '')
      .not('email', 'is', null)
      .neq('email', '')
      .not('contact_number', 'is', null)
      .neq('contact_number', '')
      .not('institution_id', 'is', null)
      .gt('institution_id', 0);
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
  /** When true, only return staff that meet enrichment target (name, role, email, contact number, institution) */
  enriched_only?: boolean;
}

export async function getStaffForExport(params: StaffExportParams): Promise<Staff[]> {
  let query = executionSupabase
    .from('staff')
    .select('*');

  const { result_id, name_search, email_search, date_from, date_to, enriched_only } = params;
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

  if (enriched_only) {
    query = query
      .not('name', 'is', null)
      .neq('name', '')
      .not('role', 'is', null)
      .neq('role', '')
      .not('email', 'is', null)
      .neq('email', '')
      .not('contact_number', 'is', null)
      .neq('contact_number', '')
      .not('institution_id', 'is', null)
      .gt('institution_id', 0);
  }

  query = query.order('created_at', { ascending: false }).limit(EXPORT_MAX_ROWS);

  const { data, error } = await query;

  if (error) throw new Error(`Error fetching staff for export: ${error.message}`);
  return (data ?? []) as Staff[];
}

export interface StaffCounts {
  total: number;
  withEmail: number;
  withoutEmail: number;
}

/** Count staff with optional 24h and enriched_only filters; includes with/without email breakdown. */
export async function getStaffCounts(last24h: boolean, enriched_only = false): Promise<StaffCounts> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let totalQuery = executionSupabase.from('staff').select('*', { count: 'exact', head: true });
  if (last24h) totalQuery = totalQuery.gte('created_at', since);
  if (enriched_only) {
    totalQuery = totalQuery
      .not('name', 'is', null)
      .neq('name', '')
      .not('role', 'is', null)
      .neq('role', '')
      .not('email', 'is', null)
      .neq('email', '')
      .not('contact_number', 'is', null)
      .neq('contact_number', '')
      .not('institution_id', 'is', null)
      .gt('institution_id', 0);
  }
  const { count: total, error: totalError } = await totalQuery;
  if (totalError) throw new Error(`Error fetching staff count: ${totalError.message}`);

  let withEmailQuery = executionSupabase
    .from('staff')
    .select('*', { count: 'exact', head: true })
    .not('email', 'is', null)
    .neq('email', '');
  if (last24h) withEmailQuery = withEmailQuery.gte('created_at', since);
  if (enriched_only) {
    withEmailQuery = withEmailQuery
      .not('name', 'is', null)
      .neq('name', '')
      .not('role', 'is', null)
      .neq('role', '')
      .not('contact_number', 'is', null)
      .neq('contact_number', '')
      .not('institution_id', 'is', null)
      .gt('institution_id', 0);
  }
  const { count: withEmail, error: withEmailError } = await withEmailQuery;
  if (withEmailError) throw new Error(`Error fetching staff with-email count: ${withEmailError.message}`);

  return {
    total: total ?? 0,
    withEmail: withEmail ?? 0,
    withoutEmail: (total ?? 0) - (withEmail ?? 0),
  };
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
