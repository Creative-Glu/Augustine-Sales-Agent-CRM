'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useSyncQueue } from '@/services/execution/useExecutionData';
import type { SyncQueueJob, SyncQueueStatus } from '@/types/execution';
import { useToastHelpers } from '@/lib/toast';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
];

const ENTITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'institution', label: 'Institution' },
  { value: 'staff', label: 'Staff' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function formatRelative(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = d.getTime() - now;
    if (diff < 0) return 'overdue';
    if (diff < 60_000) return 'in <1m';
    if (diff < 3600_000) return `in ${Math.floor(diff / 60_000)}m`;
    if (diff < 86400_000) return `in ${Math.floor(diff / 3600_000)}h`;
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}

function truncateError(err: string | null, max = 120): string {
  if (!err) return '—';
  const t = err.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function statusBadgeClass(status: SyncQueueStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30';
    case 'processing':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30';
    case 'success':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    case 'failed':
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';
    default:
      return 'bg-muted text-muted-foreground border-border/60';
  }
}

const COLUMNS = [
  { label: 'Queue ID', align: 'left' as const },
  { label: 'Entity Type', align: 'left' as const },
  { label: 'Entity Name', align: 'left' as const },
  { label: 'Status', align: 'left' as const },
  { label: 'Attempts', align: 'right' as const },
  { label: 'Next Retry', align: 'left' as const },
  { label: 'Last Error', align: 'left' as const },
  { label: 'Created', align: 'left' as const },
  { label: 'Actions', align: 'left' as const },
];

export default function ExecutionSyncQueuePage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const statusParam = searchParams.get('status') ?? '';
  const entityTypeParam = searchParams.get('entity_type') ?? '';
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10) || 50));

  const [status, setStatus] = useState(statusParam || 'all');
  const [entityType, setEntityType] = useState(entityTypeParam || 'all');

  const queueQuery = useSyncQueue({
    status: status === 'all' ? undefined : status,
    entity_type: entityType === 'all' ? undefined : entityType,
    limit,
  });
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const { successToast, errorToast } = useToastHelpers();

  const data = queueQuery.data?.data ?? [];
  const metrics = queueQuery.data?.metrics;
  const isLoading = queueQuery.isLoading;
  const isError = queueQuery.isError;

  const handleRetry = async (job: SyncQueueJob) => {
    setRetryingId(job.queue_id);
    try {
      const res = await fetch('/api/sync-retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'queue', queue_id: job.queue_id }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `Retry failed: ${res.status}`);
      }
      successToast('Job requeued successfully');
      await Promise.all([
        queueQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ['execution', 'sync-queue'] }),
        queryClient.invalidateQueries({ queryKey: ['execution', 'institution'] }),
        queryClient.invalidateQueries({ queryKey: ['execution', 'staff'] }),
        queryClient.invalidateQueries({ queryKey: ['execution', 'stats'] }),
      ]);
    } catch (e) {
      errorToast(e instanceof Error ? e.message : 'Retry failed');
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Sync Queue</CardTitle>
          <p className="text-sm text-muted-foreground">
            HubSpot sync queue jobs. Retry failed items or inspect status and attempts.
          </p>
        </CardHeader>
      </Card>

      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <Card className="border-border bg-card">
            <CardContent className="p-3">
              <p className="text-[13px] text-muted-foreground">Total Jobs</p>
              <p className="text-lg font-semibold tabular-nums">{metrics.total}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-3">
              <p className="text-[13px] text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold tabular-nums">{metrics.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-3">
              <p className="text-[13px] text-muted-foreground">Processing</p>
              <p className="text-lg font-semibold tabular-nums">{metrics.processing}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-3">
              <p className="text-[13px] text-muted-foreground">Failed</p>
              <p className="text-lg font-semibold tabular-nums">{metrics.failed}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-3">
              <p className="text-[13px] text-muted-foreground">Success</p>
              <p className="text-lg font-semibold tabular-nums">{metrics.success}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-3">
              <p className="text-[13px] text-muted-foreground">Avg Attempts</p>
              <p className="text-lg font-semibold tabular-nums">{metrics.avg_attempts?.toFixed(1) ?? '—'}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-3">
              <p className="text-[13px] text-muted-foreground">Oldest Pending</p>
              <p className="text-sm font-medium tabular-nums">
                {metrics.oldest_pending_at ? formatRelative(metrics.oldest_pending_at) : '—'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/60 flex flex-wrap items-center gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[130px] h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger className="w-[130px] h-9 text-sm">
              <SelectValue placeholder="Entity type" />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => queueQuery.refetch()}
            disabled={isLoading}
          >
            <ArrowPathIcon className="w-4 h-4 shrink-0" />
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {COLUMNS.map((col) => (
                  <th
                    key={col.label}
                    className={`py-3 px-4 text-xs font-medium text-muted-foreground ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={COLUMNS.length} className="py-12 text-center text-muted-foreground text-[13px]">
                    Loading sync queue…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={COLUMNS.length} className="py-12 text-center text-destructive text-[13px]">
                    Failed to load.{' '}
                    <button
                      type="button"
                      onClick={() => queueQuery.refetch()}
                      className="underline font-medium ml-1 hover:no-underline"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              )}
              {!isLoading && !isError && data.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="py-12 text-center text-muted-foreground text-[13px]">
                    No queue jobs.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                data.map((row, index) => (
                  <tr
                    key={row.queue_id || `${row.entity_type}-${row.entity_id}-${index}`}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-[13px] text-muted-foreground font-mono">{row.queue_id}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-[11px] font-medium capitalize">
                        {row.entity_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{row.entity_name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-muted-foreground">{row.attempts}</td>
                    <td className="py-3 px-4 text-[13px] text-muted-foreground">
                      {row.next_retry_at ? formatRelative(row.next_retry_at) : '—'}
                    </td>
                    <td
                      className="py-3 px-4 text-[13px] text-muted-foreground max-w-[200px] truncate"
                      title={row.last_error ?? undefined}
                    >
                      {truncateError(row.last_error, 120)}
                    </td>
                    <td className="py-3 px-4 text-[13px] text-muted-foreground whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      {row.status === 'failed' ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetry(row)}
                          disabled={retryingId === row.queue_id}
                        >
                          {retryingId === row.queue_id ? 'Retrying…' : 'Retry'}
                        </Button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
