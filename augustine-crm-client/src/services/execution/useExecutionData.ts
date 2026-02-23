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
import { getStaffPaginated, getStaffCounts } from './staff.service';
import { getInstitutionPaginated, getInstitutionCounts } from './institution.service';
import {
  getWebsitesUrlPaginated,
  type WebsitesUrlPaginatedParams,
} from '@/services/websites-url/websitesUrl.service';
import { getExecutionStats, getRecentJobs, getRecentFailedResults } from './stats.service';

const DEFAULT_LIMIT = 10;
const VIEWS = ['overview', 'institution', 'websites', 'jobs', 'results', 'staff'] as const;
export type ExecutionView = (typeof VIEWS)[number];

const VIEW_SEGMENTS: Record<Exclude<ExecutionView, 'overview'>, string> = {
  institution: 'institution',
  websites: 'websites',
  jobs: 'jobs',
  results: 'results',
  staff: 'staff',
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

export function useInstitutionPaginated() {
  const searchParams = useSearchParams();
  const view = useExecutionView();
  const offset = getOffset(searchParams);
  const limit = getLimit(searchParams);

  return useQuery({
    queryKey: ['execution', 'institution', view, offset, limit],
    queryFn: () => getInstitutionPaginated({ offset, limit }),
    enabled: view === 'institution',
    staleTime: 30 * 1000,
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

  return useQuery({
    queryKey: ['execution', 'staff', view, offset, limit, name_search, email_search, staff_date_from, staff_date_to],
    queryFn: () =>
      getStaffPaginated({
        offset,
        limit,
        name_search: name_search || undefined,
        email_search: email_search || undefined,
        date_from: staff_date_from || undefined,
        date_to: staff_date_to || undefined,
      }),
    enabled: view === 'staff',
    staleTime: 30 * 1000,
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

export function useStaffCounts(last24h: boolean) {
  const view = useExecutionView();
  return useQuery({
    queryKey: ['execution', 'staff-counts', last24h],
    queryFn: () => getStaffCounts(last24h),
    enabled: view === 'staff',
    staleTime: 60 * 1000,
  });
}
