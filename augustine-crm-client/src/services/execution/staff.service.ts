import { executionSupabase } from '@/lib/executionSupabaseClient';
import { Staff } from '@/types/execution';
import type { SyncStatus } from '@/types/execution';

export interface StaffPaginatedParams {
  offset: number;
  limit: number;
  name_search?: string;
  email_search?: string;
  date_from?: string; // ISO date YYYY-MM-DD
  date_to?: string;   // ISO date YYYY-MM-DD
  /** When true, only return staff that meet enrichment target (name, role, email, institution; phone optional per enriched_require_phone) */
  enriched_only?: boolean;
  /** When true with enriched_only, require contact_number. When false, phone is optional. */
  enriched_require_phone?: boolean;
  is_eligible?: boolean | null;
  synced_to_hubspot?: boolean | null;
  sync_status?: SyncStatus | null;
  /** Min confidence in percentage 0–100 (UI). Stored in DB as 0–1, so we map before query. */
  confidence_min?: number | null;
  /** Max confidence in percentage 0–100 (UI). Stored in DB as 0–1, so we map before query. */
  confidence_max?: number | null;
}

export interface StaffPaginatedResponse {
  data: Staff[];
  total: number;
  hasMore: boolean;
}

const EXPORT_MAX_ROWS = 100000;
const EXPORT_BATCH_SIZE = 1000;

export async function getStaffPaginated({
  offset,
  limit,
  name_search,
  email_search,
  date_from,
  date_to,
  enriched_only,
  enriched_require_phone = true,
  is_eligible,
  synced_to_hubspot,
  sync_status,
  confidence_min,
  confidence_max,
}: StaffPaginatedParams): Promise<StaffPaginatedResponse> {
  let query = executionSupabase
    .from('staff')
    .select('*, institutions(name)', { count: 'exact', head: false });

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

  if (enriched_only) {
    query = query
      .not('name', 'is', null)
      .neq('name', '')
      .not('role', 'is', null)
      .neq('role', '')
      .not('email', 'is', null)
      .neq('email', '')
      .ilike('email', '%@%')
      .ilike('email', '%.%')
      .not('institution_id', 'is', null)
      .gt('institution_id', 0);
    if (enriched_require_phone) {
      query = query.not('contact_number', 'is', null).neq('contact_number', '');
    }
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
  /** When true, only return staff that meet enrichment target; phone required per enriched_require_phone */
  enriched_only?: boolean;
  /** When true with enriched_only, require contact_number. When false, phone is optional. */
  enriched_require_phone?: boolean;
}

export async function getStaffForExport(params: StaffExportParams): Promise<Staff[]> {
  const {
    result_id,
    name_search,
    email_search,
    date_from,
    date_to,
    enriched_only,
    enriched_require_phone = true,
  } = params;

  const selectFields = enriched_only ? '*, institutions(name)' : '*';
  const allRows: Staff[] = [];
  let offset = 0;

  while (true) {
    let query = executionSupabase
      .from('staff')
      .select(selectFields)
      .order('created_at', { ascending: false })
      .range(offset, offset + EXPORT_BATCH_SIZE - 1);

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
        .ilike('email', '%@%')
        .ilike('email', '%.%')
        .not('institution_id', 'is', null)
        .gt('institution_id', 0);
      if (enriched_require_phone) {
        query = query.not('contact_number', 'is', null).neq('contact_number', '');
      }
    }

    const { data, error } = await query;

    if (error) throw new Error(`Error fetching staff for export: ${error.message}`);
    const batch = (data ?? []) as Staff[];
    allRows.push(...batch);

    if (batch.length < EXPORT_BATCH_SIZE || allRows.length >= EXPORT_MAX_ROWS) break;
    offset += EXPORT_BATCH_SIZE;
  }

  return allRows;
}

export interface StaffCounts {
  total: number;
  withEmail: number;
  withoutEmail: number;
}

/** Count staff with optional 24h, enriched_only, and enriched_require_phone filters; includes with/without email breakdown. */
export async function getStaffCounts(
  last24h: boolean,
  enriched_only = false,
  enriched_require_phone = true
): Promise<StaffCounts> {
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
      .ilike('email', '%@%')
      .ilike('email', '%.%')
      .not('institution_id', 'is', null)
      .gt('institution_id', 0);
    if (enriched_require_phone) {
      totalQuery = totalQuery.not('contact_number', 'is', null).neq('contact_number', '');
    }
  }
  const { count: total, error: totalError } = await totalQuery;
  if (totalError) throw new Error(`Error fetching staff count: ${totalError.message}`);

  let withEmailQuery = executionSupabase
    .from('staff')
    .select('*', { count: 'exact', head: true })
    .not('email', 'is', null)
    .neq('email', '');
  if (enriched_only) {
    withEmailQuery = withEmailQuery.ilike('email', '%@%').ilike('email', '%.%');
  }
  if (last24h) withEmailQuery = withEmailQuery.gte('created_at', since);
  if (enriched_only) {
    withEmailQuery = withEmailQuery
      .not('name', 'is', null)
      .neq('name', '')
      .not('role', 'is', null)
      .neq('role', '')
      .not('institution_id', 'is', null)
      .gt('institution_id', 0);
    if (enriched_require_phone) {
      withEmailQuery = withEmailQuery.not('contact_number', 'is', null).neq('contact_number', '');
    }
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

/** Row shape for Sync Logs page: staff and institutions with sync fields. */
export interface SyncLogEntry {
  type: 'staff' | 'institution';
  id: number | string;
  name: string;
  sync_error: string | null;
  webhook_attempts: number | null;
  last_synced_at: string | null;
  sync_status: string | null;
  synced_to_hubspot: boolean | null;
}

const SYNC_LOGS_PAGE_SIZE = 50;

export async function getSyncLogs(offset = 0): Promise<{ data: SyncLogEntry[]; total: number; hasMore: boolean }> {
  const limit = SYNC_LOGS_PAGE_SIZE * 2;
  const [staffRes, instRes] = await Promise.all([
    executionSupabase
      .from('staff')
      .select('staff_id, name, sync_error, webhook_attempts, last_synced_at, sync_status, synced_to_hubspot', {
        count: 'exact',
        head: false,
      })
      .order('last_synced_at', { ascending: false, nullsFirst: false })
      .range(0, limit - 1),
    executionSupabase
      .from('institutions')
      .select('id, name, sync_error, webhook_attempts, last_synced_at, sync_status, synced_to_hubspot', {
        count: 'exact',
        head: false,
      })
      .order('last_synced_at', { ascending: false, nullsFirst: false })
      .range(0, limit - 1),
  ]);

  const staffData = (staffRes.data ?? []).map((r: Record<string, unknown>) => ({
    type: 'staff' as const,
    id: r.staff_id,
    name: String(r.name ?? '—'),
    sync_error: r.sync_error != null ? String(r.sync_error) : null,
    webhook_attempts: typeof r.webhook_attempts === 'number' ? r.webhook_attempts : null,
    last_synced_at: r.last_synced_at != null ? String(r.last_synced_at) : null,
    sync_status: r.sync_status != null ? String(r.sync_status) : null,
    synced_to_hubspot: r.synced_to_hubspot === true,
  }));

  const instData = (instRes.data ?? []).map((r: Record<string, unknown>) => ({
    type: 'institution' as const,
    id: r.id,
    name: String(r.name ?? '—'),
    sync_error: r.sync_error != null ? String(r.sync_error) : null,
    webhook_attempts: typeof r.webhook_attempts === 'number' ? r.webhook_attempts : null,
    last_synced_at: r.last_synced_at != null ? String(r.last_synced_at) : null,
    sync_status: r.sync_status != null ? String(r.sync_status) : null,
    synced_to_hubspot: r.synced_to_hubspot === true,
  }));

  const combined = [...staffData, ...instData].sort((a, b) => {
    const aTime = a.last_synced_at ? new Date(a.last_synced_at).getTime() : 0;
    const bTime = b.last_synced_at ? new Date(b.last_synced_at).getTime() : 0;
    return bTime - aTime;
  });
  const total = (staffRes.count ?? 0) + (instRes.count ?? 0);
  const page = combined.slice(offset, offset + SYNC_LOGS_PAGE_SIZE);
  const hasMore = offset + page.length < combined.length || combined.length >= limit * 2;

  return { data: page, total, hasMore };
}
