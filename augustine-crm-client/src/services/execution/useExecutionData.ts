'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  getJobsPaginated,
  type JobStatusFilter,
} from './job.service';
import {
  getResultsPaginated,
  type ResultStatusFilter,
  type ResultSourceFilter,
} from './result.service';
import { getStaffPaginated, getStaffCounts, getSyncLogs } from './staff.service';
import { getInstitutionPaginated, getInstitutionCounts } from './institution.service';
import type { SyncStatus } from '@/types/execution';
import {
  getWebsitesUrlPaginated,
  type WebsitesUrlPaginatedParams,
} from '@/services/websites-url/websitesUrl.service';
import { getExecutionStats, getRecentJobs, getRecentFailedResults } from './stats.service';

const DEFAULT_LIMIT = 10;
const VIEWS = ['overview', 'institution', 'websites', 'jobs', 'results', 'staff', 'sync-logs'] as const;
export type ExecutionView = (typeof VIEWS)[number];

const VIEW_SEGMENTS: Record<Exclude<ExecutionView, 'overview'>, string> = {
  institution: 'institution',
  websites: 'websites',
  jobs: 'jobs',
  results: 'results',
  staff: 'staff',
  'sync-logs': 'sync-logs',
};

function getOffset(searchParams: URLSearchParams): number {
  const v = searchParams.get('offset');
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

function getLimit(searchParams: URLSearchParams): number {
  const v = searchParams.get('limit');
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isNaN(n) || n < 1 ? DEFAULT_LIMIT : Math.min(n, 100);
}

/** Derives execution view from pathname (e.g. /execution-dashboard/institution -> institution). */
export function getViewFromPathname(pathname: string | null): ExecutionView {
  if (!pathname) return 'overview';
  const base = '/execution-dashboard';
  if (pathname === base || pathname === `${base}/`) return 'overview';
  for (const [view, segment] of Object.entries(VIEW_SEGMENTS)) {
    if (pathname === `${base}/${segment}` || pathname.startsWith(`${base}/${segment}/`)) {
      return view as ExecutionView;
    }
  }
  return 'overview';
}

export function useExecutionView(): ExecutionView {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromPath = getViewFromPathname(pathname);
  if (fromPath !== 'overview') return fromPath;
  const v = searchParams.get('view');
  if (v && VIEWS.includes(v as ExecutionView)) return v as ExecutionView;
  return 'overview';
}

function parseBoolParam(sp: URLSearchParams, key: string): boolean | undefined {
  const v = sp.get(key);
  if (v === '1' || v === 'true') return true;
  if (v === '0' || v === 'false') return false;
  return undefined;
}

function parseNumParam(sp: URLSearchParams, key: string): number | undefined {
  const v = sp.get(key);
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

export function useInstitutionPaginated() {
  const searchParams = useSearchParams();
  const view = useExecutionView();
  const offset = getOffset(searchParams);
  const limit = getLimit(searchParams);
  const is_eligible = parseBoolParam(searchParams, 'is_eligible');
  const synced_to_hubspot = parseBoolParam(searchParams, 'synced_to_hubspot');
  const sync_status = (searchParams.get('sync_status') as SyncStatus | null) || undefined;
  const confidence_min = parseNumParam(searchParams, 'confidence_min');
  const confidence_max = parseNumParam(searchParams, 'confidence_max');

  return useQuery({
    queryKey: ['execution', 'institution', view, offset, limit, is_eligible, synced_to_hubspot, sync_status, confidence_min, confidence_max],
    queryFn: () =>
      getInstitutionPaginated({
        offset,
        limit,
        is_eligible: is_eligible ?? null,
        synced_to_hubspot: synced_to_hubspot ?? null,
        sync_status: sync_status ?? null,
        confidence_min: confidence_min ?? null,
        confidence_max: confidence_max ?? null,
      }),
    enabled: view === 'institution',
    staleTime: 20 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useWebsitesUrlPaginated() {
  const searchParams = useSearchParams();
  const view = useExecutionView();
  const offset = getOffset(searchParams);
  const limit = getLimit(searchParams);
  const status = searchParams.get('status') ?? undefined;
  const company_search = searchParams.get('company_search') ?? undefined;

  const params: WebsitesUrlPaginatedParams = {
    offset,
    limit,
    status: status || undefined,
    company_search: company_search || undefined,
  };

  return useQuery({
    queryKey: ['execution', 'websites-url', view, offset, limit, status, company_search],
    queryFn: () => getWebsitesUrlPaginated(params),
    enabled: view === 'websites',
    staleTime: 30 * 1000,
  });
}

export function useJobsPaginated() {
  const searchParams = useSearchParams();
  const view = useExecutionView();
  const offset = getOffset(searchParams);
  const limit = getLimit(searchParams);
  const rawStatus = searchParams.get('job_status') ?? 'all';
  const status: JobStatusFilter =
    rawStatus === 'all' || ['pending', 'running', 'completed', 'failed'].includes(rawStatus)
      ? (rawStatus as JobStatusFilter)
      : 'all';

  return useQuery({
    queryKey: ['execution', 'jobs', view, offset, limit, status],
    queryFn: () => getJobsPaginated({ offset, limit, status }),
    enabled: view === 'jobs',
    staleTime: 30 * 1000,
  });
}

export function useResultsPaginated() {
  const searchParams = useSearchParams();
  const view = useExecutionView();
  const offset = getOffset(searchParams);
  const limit = getLimit(searchParams);
  const status = (searchParams.get('result_status') as ResultStatusFilter) ?? 'all';
  const source = (searchParams.get('result_source') as ResultSourceFilter) ?? 'all';

  return useQuery({
    queryKey: ['execution', 'results', view, offset, limit, status, source],
    queryFn: () =>
      getResultsPaginated({
        offset,
        limit,
        status: status || 'all',
        source: source || 'all',
      }),
    enabled: view === 'results',
    staleTime: 30 * 1000,
  });
}

export function useExecutionStats() {
  const view = useExecutionView();

  const statsQuery = useQuery({
    queryKey: ['execution', 'stats', view],
    queryFn: getExecutionStats,
    enabled: view === 'overview',
    staleTime: 30 * 1000,
  });

  const recentJobsQuery = useQuery({
    queryKey: ['execution', 'recent-jobs', view],
    queryFn: getRecentJobs,
    enabled: view === 'overview',
    staleTime: 30 * 1000,
  });

  const recentFailedResultsQuery = useQuery({
    queryKey: ['execution', 'recent-failed-results', view],
    queryFn: getRecentFailedResults,
    enabled: view === 'overview',
    staleTime: 30 * 1000,
  });

  return {
    stats: statsQuery.data,
    recentJobs: recentJobsQuery.data ?? [],
    recentFailedResults: recentFailedResultsQuery.data ?? [],
    isLoading:
      statsQuery.isLoading || recentJobsQuery.isLoading || recentFailedResultsQuery.isLoading,
    isError: statsQuery.isError || recentJobsQuery.isError || recentFailedResultsQuery.isError,
    refetch: () => {
      statsQuery.refetch();
      recentJobsQuery.refetch();
      recentFailedResultsQuery.refetch();
    },
  };
}

export function useStaffPaginated() {
  const searchParams = useSearchParams();
  const view = useExecutionView();
  const offset = getOffset(searchParams);
  const limit = getLimit(searchParams);
  const name_search = searchParams.get('staff_name') ?? undefined;
  const email_search = searchParams.get('staff_email') ?? undefined;
  const staff_date_from = searchParams.get('staff_date_from') ?? undefined;
  const staff_date_to = searchParams.get('staff_date_to') ?? undefined;
  const enriched_only = searchParams.get('enriched') === '1';
  const enriched_require_phone = searchParams.get('phone') !== '0';
  const is_eligible = parseBoolParam(searchParams, 'is_eligible');
  const synced_to_hubspot = parseBoolParam(searchParams, 'synced_to_hubspot');
  const sync_status = (searchParams.get('sync_status') as SyncStatus | null) || undefined;
  const confidence_min = parseNumParam(searchParams, 'confidence_min');
  const confidence_max = parseNumParam(searchParams, 'confidence_max');

  return useQuery({
    queryKey: [
      'execution',
      'staff',
      view,
      offset,
      limit,
      name_search,
      email_search,
      staff_date_from,
      staff_date_to,
      enriched_only,
      enriched_require_phone,
      is_eligible,
      synced_to_hubspot,
      sync_status,
      confidence_min,
      confidence_max,
    ],
    queryFn: () =>
      getStaffPaginated({
        offset,
        limit,
        name_search: name_search || undefined,
        email_search: email_search || undefined,
        date_from: staff_date_from || undefined,
        date_to: staff_date_to || undefined,
        enriched_only,
        enriched_require_phone,
        is_eligible: is_eligible ?? undefined,
        synced_to_hubspot: synced_to_hubspot ?? undefined,
        sync_status: sync_status ?? undefined,
        confidence_min: confidence_min ?? undefined,
        confidence_max: confidence_max ?? undefined,
      }),
    enabled: view === 'staff',
    staleTime: 20 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useInstitutionCounts(last24h: boolean) {
  const view = useExecutionView();
  return useQuery({
    queryKey: ['execution', 'institution-counts', last24h],
    queryFn: () => getInstitutionCounts(last24h),
    enabled: view === 'institution',
    staleTime: 60 * 1000,
  });
}

export function useStaffCounts(last24h: boolean, enriched_only = false, enriched_require_phone = true) {
  const view = useExecutionView();
  return useQuery({
    queryKey: ['execution', 'staff-counts', last24h, enriched_only, enriched_require_phone],
    queryFn: () => getStaffCounts(last24h, enriched_only, enriched_require_phone),
    enabled: view === 'staff',
    staleTime: 60 * 1000,
  });
}

export function useSyncLogs(offset: number) {
  const view = useExecutionView();
  return useQuery({
    queryKey: ['execution', 'sync-logs', view, offset],
    queryFn: () => getSyncLogs(offset),
    enabled: view === 'sync-logs',
    staleTime: 20 * 1000,
    refetchOnWindowFocus: true,
  });
}
