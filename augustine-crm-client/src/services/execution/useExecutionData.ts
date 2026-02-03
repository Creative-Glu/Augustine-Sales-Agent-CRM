'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import {
  getJobsPaginated,
  type JobStatusFilter,
} from './job.service';
import {
  getResultsPaginated,
  type ResultStatusFilter,
  type ResultSourceFilter,
} from './result.service';
import { getStaffPaginated } from './staff.service';
import {
  getWebsitesUrlPaginated,
  type WebsitesUrlPaginatedParams,
} from '@/services/websites-url/websitesUrl.service';

const DEFAULT_LIMIT = 10;
const VIEWS = ['websites', 'jobs', 'results', 'staff'] as const;
export type ExecutionView = (typeof VIEWS)[number];

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

function getView(searchParams: URLSearchParams): ExecutionView {
  const v = searchParams.get('view');
  if (v && VIEWS.includes(v as ExecutionView)) return v as ExecutionView;
  return 'websites';
}

export function useExecutionView() {
  const searchParams = useSearchParams();
  return getView(searchParams);
}

export function useWebsitesUrlPaginated() {
  const searchParams = useSearchParams();
  const view = getView(searchParams);
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
  const view = getView(searchParams);
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
  const view = getView(searchParams);
  const offset = getOffset(searchParams);
  const limit = getLimit(searchParams);
  const job_id = searchParams.get('job_id') ?? undefined;
  const status = (searchParams.get('result_status') as ResultStatusFilter) ?? 'all';
  const source = (searchParams.get('result_source') as ResultSourceFilter) ?? 'all';

  return useQuery({
    queryKey: ['execution', 'results', view, offset, limit, job_id, status, source],
    queryFn: () =>
      getResultsPaginated({
        offset,
        limit,
        job_id,
        status: status || 'all',
        source: source || 'all',
      }),
    enabled: view === 'results',
    staleTime: 30 * 1000,
  });
}

export function useStaffPaginated() {
  const searchParams = useSearchParams();
  const view = getView(searchParams);
  const offset = getOffset(searchParams);
  const limit = getLimit(searchParams);
  const result_id = searchParams.get('result_id') ?? undefined;
  const name_search = searchParams.get('staff_name') ?? undefined;
  const email_search = searchParams.get('staff_email') ?? undefined;

  return useQuery({
    queryKey: ['execution', 'staff', view, offset, limit, result_id, name_search, email_search],
    queryFn: () =>
      getStaffPaginated({
        offset,
        limit,
        result_id,
        name_search: name_search || undefined,
        email_search: email_search || undefined,
      }),
    enabled: view === 'staff',
    staleTime: 30 * 1000,
  });
}
