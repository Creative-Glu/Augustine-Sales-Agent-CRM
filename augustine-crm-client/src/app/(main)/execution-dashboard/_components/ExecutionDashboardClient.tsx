'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Pagination from '@/components/Pagination';
import {
  useExecutionView,
  useWebsitesUrlPaginated,
  useJobsPaginated,
  useResultsPaginated,
  useStaffPaginated,
  type ExecutionView,
} from '@/services/execution/useExecutionData';
import WebsitesUrlTable from './WebsitesUrlTable';
import JobsTable from './JobsTable';
import ResultsTable from './ResultsTable';
import StaffTable from './StaffTable';
import {
  WebsitesUrlFilters,
  JobsFilters,
  ResultsFilters,
  StaffFilters,
} from './ExecutionFilters';

const VIEW_LABELS: Record<ExecutionView, string> = {
  websites: 'Website URLs',
  jobs: 'Jobs',
  results: 'Results',
  staff: 'Staff',
};

const DEFAULT_LIMIT = 10;

function getLimit(searchParams: URLSearchParams): number {
  const v = searchParams.get('limit');
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isNaN(n) || n < 1 ? DEFAULT_LIMIT : Math.min(n, 100);
}

function getOffset(searchParams: URLSearchParams): number {
  const v = searchParams.get('offset');
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

export default function ExecutionDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = useExecutionView();
  const limit = getLimit(searchParams);
  const offset = getOffset(searchParams);

  const websitesQuery = useWebsitesUrlPaginated();
  const jobsQuery = useJobsPaginated();
  const resultsQuery = useResultsPaginated();
  const staffQuery = useStaffPaginated();

  const setView = (newView: ExecutionView) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    params.delete('offset');
    router.push(`/execution-dashboard?${params.toString()}`);
  };

  const basePath = '/execution-dashboard';
  const currentOffset = offset;
  const totalWebsites = websitesQuery.data?.total ?? 0;
  const totalJobs = jobsQuery.data?.total ?? 0;
  const totalResults = resultsQuery.data?.total ?? 0;
  const totalStaff = staffQuery.data?.total ?? 0;

  const totalByView: Record<ExecutionView, number> = {
    websites: totalWebsites,
    jobs: totalJobs,
    results: totalResults,
    staff: totalStaff,
  };
  const total = totalByView[view];
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(currentOffset / limit) + 1;
  const hasMore = currentOffset + limit < total;

  return (
    <div className="space-y-6">
      <Tabs value={view} onValueChange={(v) => setView(v as ExecutionView)}>
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <TabsTrigger value="websites" className="rounded-md px-4">
            {VIEW_LABELS.websites}
          </TabsTrigger>
          <TabsTrigger value="jobs" className="rounded-md px-4">
            {VIEW_LABELS.jobs}
          </TabsTrigger>
          <TabsTrigger value="results" className="rounded-md px-4">
            {VIEW_LABELS.results}
          </TabsTrigger>
          <TabsTrigger value="staff" className="rounded-md px-4">
            {VIEW_LABELS.staff}
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-md overflow-hidden">
          <div className="p-6">
            {view === 'websites' && <WebsitesUrlFilters />}
            {view === 'jobs' && <JobsFilters />}
            {view === 'results' && <ResultsFilters />}
            {view === 'staff' && <StaffFilters />}

            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <p className="text-sm text-muted-foreground">
                Showing{' '}
                {view === 'websites' && (websitesQuery.data?.data?.length ?? 0)}
                {view === 'jobs' && (jobsQuery.data?.data?.length ?? 0)}
                {view === 'results' && (resultsQuery.data?.data?.length ?? 0)}
                {view === 'staff' && (staffQuery.data?.data?.length ?? 0)}
                {' of '}{total} {VIEW_LABELS[view].toLowerCase()}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Per page</span>
                <Select
                  value={String(limit)}
                  onValueChange={(v) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('limit', v);
                    params.delete('offset');
                    router.push(`/execution-dashboard?${params.toString()}`);
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => {
                    websitesQuery.refetch();
                    jobsQuery.refetch();
                    resultsQuery.refetch();
                    staffQuery.refetch();
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Refresh
                </button>
              </div>
            </div>

            <TabsContent value="websites" className="mt-0">
              <WebsitesUrlTable
                rows={websitesQuery.data?.data ?? []}
                isLoading={websitesQuery.isLoading}
                isError={websitesQuery.isError}
                onRetry={() => websitesQuery.refetch()}
              />
            </TabsContent>
            <TabsContent value="jobs" className="mt-0">
              <JobsTable
                rows={jobsQuery.data?.data ?? []}
                isLoading={jobsQuery.isLoading}
                isError={jobsQuery.isError}
                onRetry={() => jobsQuery.refetch()}
              />
            </TabsContent>
            <TabsContent value="results" className="mt-0">
              <ResultsTable
                rows={resultsQuery.data?.data ?? []}
                isLoading={resultsQuery.isLoading}
                isError={resultsQuery.isError}
                onRetry={() => resultsQuery.refetch()}
              />
            </TabsContent>
            <TabsContent value="staff" className="mt-0">
              <StaffTable
                rows={staffQuery.data?.data ?? []}
                isLoading={staffQuery.isLoading}
                isError={staffQuery.isError}
                onRetry={() => staffQuery.refetch()}
              />
            </TabsContent>
          </div>
        </div>

        {total > limit && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              currentOffset={currentOffset}
              limit={limit}
              hasMore={hasMore}
              basePath={basePath}
              queryParamName="offset"
            />
          </div>
        )}
      </Tabs>
    </div>
  );
}
