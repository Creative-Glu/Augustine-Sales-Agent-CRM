'use client';

import {
  BriefcaseIcon,
  GlobeAltIcon,
  DocumentCheckIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableHeader } from '@/components/TableHeader';
import { cn } from '@/lib/utils';
import type { ExecutionStats } from '@/services/execution/stats.service';
import type { Job, Result } from '@/types/execution';
import { formatDateTime } from '@/utils/format';

const jobStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  running: 'default',
  completed: 'secondary',
  failed: 'destructive',
};

const LOG_COLUMNS = [
  { label: 'Status', align: 'left' as const },
  { label: 'URLs', align: 'right' as const },
  { label: 'Submitted', align: 'left' as const },
  { label: 'Updated', align: 'left' as const },
  { label: 'Processing time', align: 'right' as const },
  { label: 'Error', align: 'left' as const },
];

function formatDuration(ms: number): string {
  if (ms < 0) return '—';
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  if (hr > 0) return `${hr}h ${min % 60}m`;
  if (min > 0) return `${min}m ${sec % 60}s`;
  return `${sec}s`;
}

function getJobProcessingTime(job: Job): string {
  if (job.status !== 'completed' && job.status !== 'failed') return '—';
  const submitted = job.submitted_at ? new Date(job.submitted_at).getTime() : NaN;
  const updated = job.updated_at ? new Date(job.updated_at).getTime() : NaN;
  if (Number.isNaN(submitted) || Number.isNaN(updated)) return '—';
  return formatDuration(updated - submitted);
}

const FAILED_RESULTS_COLUMNS = [
  { label: 'URL', align: 'left' as const },
  { label: 'Source', align: 'left' as const },
  { label: 'Processed', align: 'left' as const },
  { label: 'Error', align: 'left' as const },
];

interface ExecutionKpiDashboardProps {
  stats: ExecutionStats | undefined;
  recentJobs: Job[];
  recentFailedResults: Result[];
  isLoading: boolean;
  isRecentJobsLoading?: boolean;
  isRecentFailedResultsLoading?: boolean;
  isError: boolean;
  onRetry: () => void;
}

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  hint,
}: {
  title: string;
  value: number | string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <Card className="border-border bg-card hover:border-border/80 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground/80" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums text-foreground">{value}</div>
        {sub != null && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        {hint != null && (
          <p className="text-[11px] text-muted-foreground/90 mt-0.5 italic">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ExecutionKpiDashboard({
  stats,
  recentJobs,
  recentFailedResults,
  isLoading,
  isRecentJobsLoading = false,
  isRecentFailedResultsLoading = false,
  isError,
  onRetry,
}: ExecutionKpiDashboardProps) {
  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-pulse text-sm text-muted-foreground font-medium">Loading KPI dashboard…</div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="py-16 text-center">
        <p className="text-destructive text-sm mb-3">Failed to load dashboard.</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry} className="gap-2 cursor-pointer">
          <ArrowPathIcon className="w-4 h-4 shrink-0" />
          Retry
        </Button>
      </div>
    );
  }

  const { jobs, websites, results, institutions, staff, institutionSync, staffSync } = stats;
  const successRate =
    results.total > 0 ? Math.round((results.success / results.total) * 100) : null;
  const instSync = institutionSync ?? { eligible: 0, synced: 0, failed: 0 };
  const stSync = staffSync ?? { eligible: 0, synced: 0, failed: 0 };
  const totalSynced = (instSync.synced ?? 0) + (stSync.synced ?? 0);
  const totalSyncFailed = (instSync.failed ?? 0) + (stSync.failed ?? 0);
  const totalEligible = (instSync.eligible ?? 0) + (stSync.eligible ?? 0);
  const syncProgressPct = totalEligible > 0 ? Math.round((totalSynced / totalEligible) * 100) : 0;

  // Pipeline status: healthy | busy | attention
  const hasFailures = jobs.failed > 0 || websites.failed > 0 || totalSyncFailed > 0 || (results.error ?? 0) > 0;
  const isBusy = jobs.running > 0;
  const status = hasFailures ? 'attention' : isBusy ? 'busy' : 'healthy';
  const statusConfig = {
    healthy: {
      label: 'All good',
      desc: successRate != null && results.total > 0
        ? `${successRate}% of URLs processed successfully. Pipeline is idle.`
        : 'Pipeline is idle. Run jobs from the Jobs tab.',
      className: 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10',
      icon: CheckCircleIcon,
      iconClassName: 'text-emerald-600 dark:text-emerald-400',
    },
    busy: {
      label: 'Jobs running',
      desc: `${jobs.running} job${jobs.running === 1 ? '' : 's'} in progress. Results will appear as they complete.`,
      className: 'border-blue-500/50 bg-blue-500/5 dark:bg-blue-500/10',
      icon: ClockIcon,
      iconClassName: 'text-blue-600 dark:text-blue-400',
    },
    attention: {
      label: 'Needs attention',
      desc: [
        jobs.failed > 0 && `${jobs.failed} failed job${jobs.failed === 1 ? '' : 's'}`,
        (results.error ?? 0) > 0 && `${results.error} failed result${results.error === 1 ? '' : 's'}`,
        totalSyncFailed > 0 && `${totalSyncFailed} sync failed`,
      ].filter(Boolean).join(' · ') || 'Some items need review.',
      className: 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10',
      icon: ExclamationTriangleIcon,
      iconClassName: 'text-amber-600 dark:text-amber-400',
    },
  } as const;
  const sc = statusConfig[status];
  const StatusIcon = sc.icon;

  return (
    <div className="space-y-8">
      {/* Hero status card */}
      <Card className={cn('overflow-hidden border-l-4', sc.className)}>
        <CardContent className="flex flex-row items-start gap-4 py-5 pr-5 pl-4">
          <div className={cn('rounded-full p-2 bg-background/80 shrink-0', sc.iconClassName)}>
            <StatusIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">{sc.label}</span>
              <Badge variant={status === 'healthy' ? 'secondary' : status === 'busy' ? 'default' : 'outline'} className="text-xs">
                {status === 'healthy' ? 'Healthy' : status === 'busy' ? 'Busy' : 'Review'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{sc.desc}</p>
          </div>
          {successRate != null && results.total > 0 && status === 'healthy' && (
            <div className="hidden sm:block text-right shrink-0">
              <span className="text-3xl font-bold tabular-nums text-foreground">{successRate}%</span>
              <p className="text-xs text-muted-foreground">success rate</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pipeline – extraction health */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SparklesIcon className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Extraction pipeline</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {results.total > 0
            ? `${results.total} URL${results.total === 1 ? '' : 's'} processed from websites and PDFs.`
            : 'Jobs process URLs and extract data. Run a job from the Jobs tab to get started.'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <KpiCard
            title="Jobs"
            value={jobs.total}
            sub={`${jobs.completed} done · ${jobs.failed} failed`}
            icon={BriefcaseIcon}
            hint={jobs.running > 0 ? `${jobs.running} in progress` : undefined}
          />
          <KpiCard
            title="Websites"
            value={websites.total}
            sub={`${websites.success} ok · ${websites.failed} failed`}
            icon={GlobeAltIcon}
          />
          <KpiCard
            title="Results"
            value={results.total}
            sub={successRate != null ? `${successRate}% success` : undefined}
            icon={DocumentCheckIcon}
          />
        </div>
      </div>

      {/* Extracted data – story + numbers */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BuildingOffice2Icon className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">What we’ve extracted</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Institutions and staff contacts pulled from PDFs and web — ready to enrich and sync.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-border bg-card overflow-hidden">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Institutions</p>
                  <p className="text-2xl font-bold tabular-nums text-foreground mt-0.5">{institutions}</p>
                </div>
                <BuildingOffice2Icon className="h-10 w-10 text-muted-foreground/40" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card overflow-hidden">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Staff contacts</p>
                  <p className="text-2xl font-bold tabular-nums text-foreground mt-0.5">{staff}</p>
                </div>
                <UserGroupIcon className="h-10 w-10 text-muted-foreground/40" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* HubSpot sync – progress + cards */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <DocumentCheckIcon className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">HubSpot sync</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {totalEligible > 0
            ? `${totalSynced} of ${totalEligible} eligible record${totalEligible === 1 ? '' : 's'} synced to HubSpot.`
            : 'Mark institutions or staff as eligible in their tabs, then sync to HubSpot.'}
        </p>
        {totalEligible > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Sync progress</span>
              <span className="tabular-nums">{totalSynced} / {totalEligible} · {syncProgressPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${syncProgressPct}%` }}
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard
            title="Eligible institutions"
            value={instSync.eligible}
            icon={BuildingOffice2Icon}
            hint="Ready to sync"
          />
          <KpiCard
            title="Eligible staff"
            value={stSync.eligible}
            icon={UserGroupIcon}
            hint="Ready to sync"
          />
          <KpiCard
            title="Synced"
            value={totalSynced}
            sub={`${instSync.synced ?? 0} inst · ${stSync.synced ?? 0} staff`}
            icon={DocumentCheckIcon}
            hint="In HubSpot"
          />
          <KpiCard
            title="Sync failed"
            value={totalSyncFailed}
            sub={totalSyncFailed > 0 ? 'Needs retry' : undefined}
            icon={ExclamationTriangleIcon}
            hint={totalSyncFailed > 0 ? 'Check sync status' : undefined}
          />
        </div>
        {totalSyncFailed > 0 && (
          <p className="text-xs mt-3 text-amber-700 dark:text-amber-400">
            Tip: Open the Institution or Staff tab, filter by sync status, and retry failed syncs.
          </p>
        )}
      </div>

      {/* Recent activity log */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Recent job activity</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Latest job runs — status, timing, and errors.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <TableHeader columns={LOG_COLUMNS} />
              <tbody>
                {isRecentJobsLoading ? (
                  <tr>
                    <td colSpan={LOG_COLUMNS.length} className="py-6 text-center text-muted-foreground text-sm">
                      Loading…
                    </td>
                  </tr>
                ) : recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={LOG_COLUMNS.length} className="py-8 text-center text-muted-foreground">
                      No jobs yet.
                    </td>
                  </tr>
                ) : (
                  recentJobs.map((row) => (
                    <tr
                      key={row.job_id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Badge variant={jobStatusVariant[row.status] ?? 'secondary'} className="text-xs">
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        {row.urls?.length ?? 0}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {formatDateTime(row.submitted_at)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {formatDateTime(row.updated_at)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-muted-foreground">
                        {getJobProcessingTime(row)}
                      </td>
                      <td className="py-3 px-4 text-destructive max-w-[200px] truncate" title={row.error ?? ''}>
                        {row.error ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent failed results */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base">Recent failed results</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            URLs that errored during processing — open the Results tab to filter and retry.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <TableHeader columns={FAILED_RESULTS_COLUMNS} />
              <tbody>
                {isRecentFailedResultsLoading ? (
                  <tr>
                    <td colSpan={FAILED_RESULTS_COLUMNS.length} className="py-6 text-center text-muted-foreground text-sm">
                      Loading…
                    </td>
                  </tr>
                ) : recentFailedResults.length === 0 ? (
                  <tr>
                    <td colSpan={FAILED_RESULTS_COLUMNS.length} className="py-8 text-center text-muted-foreground">
                      No failed results.
                    </td>
                  </tr>
                ) : (
                  recentFailedResults.map((row) => (
                    <tr
                      key={row.result_id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <a
                          href={row.url.startsWith('http') ? row.url : `https://${row.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate max-w-[220px] inline-block"
                        >
                          {row.url}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {row.source}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{formatDateTime(row.processed_at)}</td>
                      <td
                        className="py-3 px-4 text-destructive max-w-[280px] truncate"
                        title={row.error ?? row.error_type ?? ''}
                      >
                        {row.error ?? row.error_type ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
