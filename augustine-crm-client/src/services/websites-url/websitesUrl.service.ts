import { executionSupabase } from '@/lib/executionSupabaseClient';
import { WebsitesUrl } from '@/types/websitesUrl';

export interface WebsitesUrlPaginatedParams {
  offset: number;
  limit: number;
  status?: string;
  company_search?: string;
}

export interface WebsitesUrlPaginatedResponse {
  data: WebsitesUrl[];
  total: number;
  hasMore: boolean;
}

/** Get state value from a websites_url row. Handles both column names: "State - Dropdown (COMPANY)" and "state". */
export function getStateValue(row: WebsitesUrl): string {
  return (row['State - Dropdown (COMPANY)'] || row.State || '').trim();
}

export async function getWebsitesUrl(): Promise<WebsitesUrl[]> {
  const { data, error } = await executionSupabase.from('websites_url').select('*');

  if (error) throw new Error(`Error fetching websites URL: ${error.message}`);
  return (data ?? []) as WebsitesUrl[];
}

/** Known US states + DC + Canada present in the websites_url table. Hardcoded for instant dropdown load. */
const KNOWN_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Canada',
  'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida',
  'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
  'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
  'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

/** Return known state list instantly (no DB round-trip needed). */
export async function getDistinctStates(): Promise<string[]> {
  return KNOWN_STATES;
}

/** Normalize a URL to its bare domain. e.g. "https://saintliz.org/staff" → "saintliz.org" */
function normalizeUrlToDomain(url: string | null | undefined): string {
  if (!url) return '';
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

/** Build a multi-key lookup map from websites_url rows. Keys by Company name, Website URL, and domain. */
function buildWebsitesUrlMap(rows: WebsitesUrl[]): Map<string, WebsitesUrl> {
  const map = new Map<string, WebsitesUrl>();
  for (const row of rows) {
    if (row['Company name']) map.set(row['Company name'], row);
    if (row['Website URL']) map.set(row['Website URL'], row);
    const domain = normalizeUrlToDomain(row['Website URL']);
    if (domain) map.set(domain, row);
  }
  return map;
}

/** Fetch all websites_url rows with pagination (Supabase caps at 1000 per request). */
async function fetchAllWebsitesUrl(): Promise<WebsitesUrl[]> {
  const PAGE = 1000;
  const allRows: WebsitesUrl[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await executionSupabase
      .from('websites_url')
      .select('*')
      .range(offset, offset + PAGE - 1);

    if (error) throw new Error(`Error fetching websites URL: ${error.message}`);
    const rows = (data ?? []) as WebsitesUrl[];
    allRows.push(...rows);
    if (rows.length < PAGE) break;
    offset += PAGE;
  }
  return allRows;
}

/** Fetch websites_url records filtered by state. Returns a multi-key Map for flexible lookup. */
export async function getWebsitesUrlByState(state: string): Promise<Map<string, WebsitesUrl>> {
  // Fetch all and filter client-side because PostgREST can't filter on columns with spaces/parens
  const allRows = await fetchAllWebsitesUrl();
  const filtered = allRows.filter(
    (r) => getStateValue(r).toLowerCase() === state.toLowerCase()
  );
  return buildWebsitesUrlMap(filtered);
}

/** Fetch all websites_url records as a multi-key Map for flexible lookup. */
export async function getWebsitesUrlMap(): Promise<Map<string, WebsitesUrl>> {
  const allRows = await fetchAllWebsitesUrl();
  return buildWebsitesUrlMap(allRows);
}

export async function getWebsitesUrlPaginated({
  offset,
  limit,
  status,
  company_search,
}: WebsitesUrlPaginatedParams): Promise<WebsitesUrlPaginatedResponse> {
  let query = executionSupabase
    .from('websites_url')
    .select('*', { count: 'exact', head: false });

  // Match status case-insensitively so "Failed" in DB matches filter value "failed"
  if (status?.trim()) query = query.ilike('Status', status.trim());
  if (company_search?.trim())
    query = query.ilike('Company name', `%${company_search.trim()}%`);

  // Sort by most recently updated first; place nulls last so older/empty rows don't appear on top
  query = query
    .order('updated_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Error fetching websites URL: ${error.message}`);

  const total = count ?? 0;
  const hasMore = offset + (data?.length ?? 0) < total;

  return {
    data: (data ?? []) as WebsitesUrl[],
    total,
    hasMore,
  };
}
