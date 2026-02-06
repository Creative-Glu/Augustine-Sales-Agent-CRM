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

export async function getWebsitesUrl(): Promise<WebsitesUrl[]> {
  const { data, error } = await executionSupabase.from('websites_url').select('*');

  if (error) throw new Error(`Error fetching websites URL: ${error.message}`);
  return (data ?? []) as WebsitesUrl[];
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

  if (status?.trim()) query = query.eq('Status', status.trim());
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
