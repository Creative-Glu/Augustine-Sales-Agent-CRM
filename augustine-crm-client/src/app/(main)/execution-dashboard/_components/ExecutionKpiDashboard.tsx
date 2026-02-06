'use client';

import {
  BriefcaseIcon,
  GlobeAltIcon,
  DocumentCheckIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableHeader } from '@/components/TableHeader';
import type { ExecutionStats } from '@/services/execution/stats.service';
import type { Job } from '@/types/execution';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

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
  { label: 'Error', align: 'left' as const },
];

interface ExecutionKpiDashboardProps {
  stats: ExecutionStats | undefined;
  recentJobs: Job[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums text-foreground">{value}</div>
        {sub != null && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function ExecutionKpiDashboard({
  stats,
  recentJobs,
  isLoading,
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

  const { jobs, websites, results, institutions, staff } = stats;
  const successRate =
    results.total > 0 ? Math.round((results.success / results.total) * 100) : null;

  return (
    <div className="space-y-8">
      {/* Top-level KPIs */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="Total jobs"
            value={jobs.total}
            sub={`${jobs.completed} completed · ${jobs.failed} failed`}
            icon={BriefcaseIcon}
          />
          <KpiCard
            title="Websites in pipeline"
            value={websites.total}
            sub={`${websites.success} Success · ${websites.failed} Failed`}
            icon={GlobeAltIcon}
          />
          <KpiCard
            title="Results processed"
            value={results.total}
            sub={successRate != null ? `${successRate}% success rate` : undefined}
            icon={DocumentCheckIcon}
          />
          <KpiCard title="Institutions" value={institutions} icon={BuildingOffice2Icon} />
          <KpiCard title="Staff extracted" value={staff} icon={UserGroupIcon} />
        </div>
      </div>

      {/* Jobs & Websites breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Jobs by status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="text-xs">
                Pending: {jobs.pending}
              </Badge>
              <Badge variant="default" className="text-xs">
                Running: {jobs.running}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Completed: {jobs.completed}
              </Badge>
              <Badge variant="destructive" className="text-xs">
                Failed: {jobs.failed}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Websites by status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="text-xs">
                Success: {websites.success}
              </Badge>
              <Badge variant="destructive" className="text-xs">
                Failed: {websites.failed}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Processing: {websites.processing}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Pending: {websites.pending}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Missing URL: {websites.missingUrl}
              </Badge>
              {websites.other > 0 && (
                <Badge variant="outline" className="text-xs">
                  Other: {websites.other}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity log */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Recent job activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <TableHeader columns={LOG_COLUMNS} />
              <tbody>
                {recentJobs.length === 0 ? (
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
                        {formatDate(row.submitted_at)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {formatDate(row.updated_at)}
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
    </div>
  );
}
