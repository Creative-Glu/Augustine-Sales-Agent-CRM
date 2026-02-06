'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DocumentArrowDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Pagination from '@/components/Pagination';
import {
  useExecutionView,
  useExecutionStats,
  useInstitutionPaginated,
  useWebsitesUrlPaginated,
  useJobsPaginated,
  useResultsPaginated,
  useStaffPaginated,
  type ExecutionView,
} from '@/services/execution/useExecutionData';
import { getStaffForExport } from '@/services/execution/staff.service';
import { useToastHelpers } from '@/lib/toast';
import type { Staff } from '@/types/execution';
import type { Institution } from '@/types/execution';
import WebsitesUrlTable from './WebsitesUrlTable';
import JobsTable from './JobsTable';
import ResultsTable from './ResultsTable';
import StaffTable from './StaffTable';
import InstitutionTable from './InstitutionTable';
import InstitutionStaffModal from './InstitutionStaffModal';
import ExecutionKpiDashboard from './ExecutionKpiDashboard';
import {
  WebsitesUrlFilters,
  JobsFilters,
  ResultsFilters,
  StaffFilters,
} from './ExecutionFilters';

function escapeCsvCell(value: string | null): string {
  if (value == null) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function staffToCsv(rows: Staff[]): string {
  const header = 'staff_id,result_id,name,role,email,contact_number,created_at';
  const body = rows.map(
    (r) =>
      [r.staff_id, r.result_id, r.name, r.role, r.email, r.contact_number, r.created_at]
        .map(escapeCsvCell)
        .join(',')
  );
  return [header, ...body].join('\r\n');
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const VIEW_LABELS: Record<ExecutionView, string> = {
  overview: 'Overview',
  institution: 'Institution',
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

  const statsQuery = useExecutionStats();
  const institutionQuery = useInstitutionPaginated();
  const websitesQuery = useWebsitesUrlPaginated();
  const jobsQuery = useJobsPaginated();
  const resultsQuery = useResultsPaginated();
  const staffQuery = useStaffPaginated();
  const [exportingStaff, setExportingStaff] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [institutionModalOpen, setInstitutionModalOpen] = useState(false);
  const { successToast, errorToast } = useToastHelpers();

  const openInstitutionStaff = (institution: Institution) => {
    setSelectedInstitution(institution);
    setInstitutionModalOpen(true);
  };

  const setView = (newView: ExecutionView) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    params.delete('offset');
    router.push(`/execution-dashboard?${params.toString()}`);
  };

  const basePath = '/execution-dashboard';
  const currentOffset = offset;
  const totalInstitutions = institutionQuery.data?.total ?? 0;
  const totalWebsites = websitesQuery.data?.total ?? 0;
  const totalJobs = jobsQuery.data?.total ?? 0;
  const totalResults = resultsQuery.data?.total ?? 0;
  const totalStaff = staffQuery.data?.total ?? 0;

  const totalByView: Record<ExecutionView, number> = {
    overview: 0,
    institution: totalInstitutions,
    websites: totalWebsites,
    jobs: totalJobs,
    results: totalResults,
    staff: totalStaff,
  };
  const total = totalByView[view];
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(currentOffset / limit) + 1;
  const hasMore = currentOffset + limit < total;
  const showPagination = view !== 'overview' && total > limit;

  return (
    <div className="space-y-6">
      <Tabs value={view} onValueChange={(v) => setView(v as ExecutionView)}>
        <TabsList className="h-11 bg-muted/60 dark:bg-muted/30 p-1.5 rounded-xl border border-border/60 shadow-sm">
          <TabsTrigger
            value="overview"
            className="cursor-pointer rounded-lg px-5 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 transition-colors"
          >
            {VIEW_LABELS.overview}
          </TabsTrigger>
          <TabsTrigger
            value="institution"
            className="cursor-pointer rounded-lg px-5 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 transition-colors"
          >
            {VIEW_LABELS.institution}
          </TabsTrigger>
          <TabsTrigger
            value="websites"
            className="cursor-pointer rounded-lg px-5 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 transition-colors"
          >
            {VIEW_LABELS.websites}
          </TabsTrigger>
          <TabsTrigger
            value="jobs"
            className="cursor-pointer rounded-lg px-5 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 transition-colors"
          >
            {VIEW_LABELS.jobs}
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="cursor-pointer rounded-lg px-5 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 transition-colors"
          >
            {VIEW_LABELS.results}
          </TabsTrigger>
          <TabsTrigger
            value="staff"
            className="cursor-pointer rounded-lg px-5 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 transition-colors"
          >
            {VIEW_LABELS.staff}
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6">
            {view === 'overview' && (
              <ExecutionKpiDashboard
                stats={statsQuery.stats}
                recentJobs={statsQuery.recentJobs}
                isLoading={statsQuery.isLoading}
                isError={statsQuery.isError}
                onRetry={statsQuery.refetch}
              />
            )}

            {view !== 'overview' && (
              <>
                {view === 'institution' && null}
                {view === 'websites' && <WebsitesUrlFilters />}
                {view === 'jobs' && <JobsFilters />}
                {view === 'results' && <ResultsFilters />}
                {view === 'staff' && <StaffFilters />}

                <div className="flex items-center justify-between gap-4 flex-wrap py-4 border-b border-border/60">
              <p className="text-sm text-muted-foreground font-medium">
                Showing{' '}
                <span className="text-foreground">
                  {view === 'institution' && (institutionQuery.data?.data?.length ?? 0)}
                  {view === 'websites' && (websitesQuery.data?.data?.length ?? 0)}
                  {view === 'jobs' && (jobsQuery.data?.data?.length ?? 0)}
                  {view === 'results' && (resultsQuery.data?.data?.length ?? 0)}
                  {view === 'staff' && (staffQuery.data?.data?.length ?? 0)}
                </span>
                {' of '}
                <span className="text-foreground">{total}</span>
                {' '}{VIEW_LABELS[view].toLowerCase()}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {view === 'staff' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={exportingStaff}
                    onClick={async () => {
                      setExportingStaff(true);
                      try {
                        const params = {
                          name_search: searchParams.get('staff_name') || undefined,
                          email_search: searchParams.get('staff_email') || undefined,
                          date_from: searchParams.get('staff_date_from') || undefined,
                          date_to: searchParams.get('staff_date_to') || undefined,
                        };
                        const rows = await getStaffForExport(params);
                        if (rows.length === 0) {
                          errorToast('No staff records to export with current filters.');
                          return;
                        }
                        const csv = staffToCsv(rows);
                        downloadCsv(csv, `staff_export_${new Date().toISOString().slice(0, 10)}.csv`);
                        successToast(`Exported ${rows.length} staff record(s).`);
                      } catch (e) {
                        errorToast(e instanceof Error ? e.message : 'Export failed');
                      } finally {
                        setExportingStaff(false);
                      }
                    }}
                    className="gap-2"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4 shrink-0" />
                    {exportingStaff ? 'Exporting…' : 'Export CSV'}
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Per page</span>
                  <Select
                    value={String(limit)}
                    onValueChange={(v) => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('limit', v);
                      params.delete('offset');
                      router.push(`/execution-dashboard?${params.toString()}`);
                    }}
                  >
                    <SelectTrigger className="w-[72px] h-9 border-border/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    statsQuery.refetch();
                    institutionQuery.refetch();
                    websitesQuery.refetch();
                    jobsQuery.refetch();
                    resultsQuery.refetch();
                    staffQuery.refetch();
                  }}
                >
                  <ArrowPathIcon className="w-4 h-4 shrink-0" />
                  Refresh
                </Button>
              </div>
            </div>

            <TabsContent value="overview" className="mt-0 hidden">
              {/* Overview content rendered above via view === 'overview' */}
            </TabsContent>
            <TabsContent value="institution" className="mt-0">
              <InstitutionTable
                rows={institutionQuery.data?.data ?? []}
                isLoading={institutionQuery.isLoading}
                isError={institutionQuery.isError}
                onRetry={() => institutionQuery.refetch()}
                onSelect={openInstitutionStaff}
              />
            </TabsContent>
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
              </>
            )}
          </div>
        </div>

        <InstitutionStaffModal
          institution={selectedInstitution}
          open={institutionModalOpen}
          onOpenChange={setInstitutionModalOpen}
        />

        {showPagination && (
          <div className="mt-6">
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
