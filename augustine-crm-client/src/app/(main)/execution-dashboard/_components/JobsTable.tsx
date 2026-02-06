'use client';

import { TableHeader } from '@/components/TableHeader';
import { Job } from '@/types/execution';
import { Badge } from '@/components/ui/badge';

const COLUMNS = [
  { label: 'Status', align: 'left' as const },
  { label: 'URLs count', align: 'right' as const },
  { label: 'Submitted', align: 'left' as const },
  { label: 'Started', align: 'left' as const },
  { label: 'Completed', align: 'left' as const },
  { label: 'Execution time', align: 'right' as const },
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

function getJobExecutionTime(job: Job): string {
  if (job.status !== 'completed' && job.status !== 'failed') return '—';
  const submitted = job.submitted_at ? new Date(job.submitted_at).getTime() : NaN;
  const updated = job.updated_at ? new Date(job.updated_at).getTime() : NaN;
  if (Number.isNaN(submitted) || Number.isNaN(updated)) return '—';
  return formatDuration(updated - submitted);
}

function cell(value: string | null | undefined): string {
  return value ?? '—';
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  running: 'default',
  completed: 'secondary',
  failed: 'destructive',
};

export default function JobsTable({
  rows,
  isLoading,
  isError,
  onRetry,
}: {
  rows: Job[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}) {
  const colSpan = COLUMNS.length;

  return (
    <div className="w-full rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <TableHeader columns={COLUMNS} />
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-muted-foreground text-sm">
                  Loading jobs…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-destructive text-sm">
                  Failed to load.{' '}
                  {onRetry && (
                    <button type="button" onClick={onRetry} className="underline font-medium ml-1 hover:no-underline">
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-muted-foreground text-sm">
                  No jobs found.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <tr key={row.job_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <Badge variant={statusVariant[row.status] ?? 'secondary'} className="text-xs">
                      {row.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-sm">{row.urls?.length ?? 0}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(row.submitted_at)}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(row.started_at)}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(row.completed_at)}</td>
                  <td className="py-3 px-4 text-sm text-right tabular-nums text-muted-foreground">
                    {getJobExecutionTime(row)}
                  </td>
                  <td className="py-3 px-4 text-sm text-red-600 max-w-[200px] truncate" title={cell(row.error)}>
                    {cell(row.error)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
