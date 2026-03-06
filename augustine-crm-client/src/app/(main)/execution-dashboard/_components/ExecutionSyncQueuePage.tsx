'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  getHubspotSyncConfig,
  getHubspotExtendedHealth,
  runHubspotBatchSync,
  updateHubspotSyncConfig,
  type HubspotEntityType,
} from '@/services/augustine/hubspotSync.service';
import { useAuth } from '@/providers/AuthProvider';

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
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const statusParam = searchParams.get('status') ?? '';
  const entityTypeParam = searchParams.get('entity_type') ?? '';
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10) || 50));
  const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10) || 0);

  const [status, setStatus] = useState(statusParam || 'all');
  const [entityType, setEntityType] = useState(entityTypeParam || 'all');

  const queueQuery = useSyncQueue({
    status: status === 'all' ? undefined : status,
    entity_type: entityType === 'all' ? undefined : entityType,
    limit,
    offset,
  });
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const { successToast, errorToast } = useToastHelpers();

  const data = queueQuery.data?.data ?? [];
  const metrics = queueQuery.data?.metrics;
  const total = queueQuery.data?.total ?? metrics?.total ?? 0;
  const pageSize = limit;
  const currentPage = pageSize > 0 ? Math.floor(offset / pageSize) + 1 : 1;
  const totalPages = pageSize > 0 && total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = total === 0 ? 0 : Math.min(offset + pageSize, total);
  const canPrev = offset > 0;
  const canNext = offset + pageSize < total;
  const isLoading = queueQuery.isLoading;
  const isError = queueQuery.isError;

  const handlePageChange = (nextOffset: number) => {
    const clampedOffset = Math.max(0, nextOffset);
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', String(clampedOffset));
    params.set('limit', String(pageSize));
    router.push(`?${params.toString()}`);
  };

  // HubSpot sync config + health
  const [hubspotSyncEnabled, setHubspotSyncEnabled] = useState<boolean | null>(null);
  const [hubspotConfigured, setHubspotConfigured] = useState<boolean | null>(null);
  const [hubspotWorkerRunning, setHubspotWorkerRunning] = useState<boolean | null>(null);
  const [hubspotSyncAllowed, setHubspotSyncAllowed] = useState<boolean | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [updatingConfig, setUpdatingConfig] = useState(false);

  // Batch sync form
  const [batchEntityType, setBatchEntityType] = useState<'all' | HubspotEntityType>('all');
  const [batchLimit, setBatchLimit] = useState<number>(100);
  const [runningBatch, setRunningBatch] = useState(false);

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

  // Load initial HubSpot config + health (admin only)
  useEffect(() => {
    if (user?.role !== 'Admin') return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoadingConfig(true);
        const [config, health] = await Promise.all([
          getHubspotSyncConfig(),
          getHubspotExtendedHealth(),
        ]);
        if (cancelled) return;
        setHubspotSyncEnabled(config.enabled);
        setHubspotConfigured(health.enabled);
        setHubspotWorkerRunning(health.worker_running);
        setHubspotSyncAllowed(health.sync_enabled);
      } catch (e) {
        if (!cancelled) {
          errorToast(
            e instanceof Error
              ? e.message
              : 'Failed to load HubSpot sync configuration.'
          );
        }
      } finally {
        if (!cancelled) setLoadingConfig(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const handleToggleSync = async (next: boolean) => {
    if (user?.role !== 'Admin') return;
    const prev = hubspotSyncEnabled;
    setHubspotSyncEnabled(next);
    setUpdatingConfig(true);
    try {
      const res = await updateHubspotSyncConfig(next);
      setHubspotSyncEnabled(res.enabled);
      // refresh health so sync_enabled stays in sync
      const health = await getHubspotExtendedHealth();
      setHubspotConfigured(health.enabled);
      setHubspotWorkerRunning(health.worker_running);
      setHubspotSyncAllowed(health.sync_enabled);
      successToast(
        res.enabled ? 'HubSpot sync enabled.' : 'HubSpot sync disabled.'
      );
    } catch (e) {
      setHubspotSyncEnabled(prev ?? false);
      errorToast(
        e instanceof Error
          ? e.message
          : 'Failed to update HubSpot sync configuration.'
      );
    } finally {
      setUpdatingConfig(false);
    }
  };

  const handleRunBatch = async () => {
    if (user?.role !== 'Admin') return;
    if (!Number.isFinite(batchLimit) || batchLimit < 1 || batchLimit > 1000) {
      errorToast('Limit must be between 1 and 1000.');
      return;
    }
    setRunningBatch(true);
    try {
      const entity_type: HubspotEntityType | null =
        batchEntityType === 'all' ? null : batchEntityType;
      const res = await runHubspotBatchSync(entity_type, batchLimit);
      if (!res.enabled) {
        errorToast('HubSpot sync is currently turned off.');
      } else {
        successToast('Batch HubSpot sync triggered.');
        await Promise.all([
          queueQuery.refetch(),
          queryClient.invalidateQueries({ queryKey: ['execution', 'sync-queue'] }),
          queryClient.invalidateQueries({ queryKey: ['execution', 'institution'] }),
          queryClient.invalidateQueries({ queryKey: ['execution', 'staff'] }),
          queryClient.invalidateQueries({ queryKey: ['execution', 'stats'] }),
        ]);
      }
    } catch (e) {
      errorToast(
        e instanceof Error ? e.message : 'Failed to run batch HubSpot sync.'
      );
    } finally {
      setRunningBatch(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">HubSpot Sync</CardTitle>
          <p className="text-sm text-muted-foreground">
            Control HubSpot sync behaviour and inspect the sync queue.
          </p>
        </CardHeader>
        {user?.role === 'Admin' && (
          <CardContent className="border-t border-border/60 pt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Switch
                    id="hubspot-sync-toggle"
                    checked={!!hubspotSyncEnabled}
                    onCheckedChange={handleToggleSync}
                    disabled={updatingConfig}
                  />
                  <Label
                    htmlFor="hubspot-sync-toggle"
                    className="text-sm font-medium text-foreground"
                  >
                    HubSpot sync
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  When off, no new HubSpot sync jobs are queued.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="text-muted-foreground">HubSpot configured</p>
                  <p className="font-semibold">
                    {hubspotConfigured == null
                      ? '—'
                      : hubspotConfigured
                        ? 'Yes'
                        : 'No'}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground">Sync worker running</p>
                  <p className="font-semibold">
                    {hubspotWorkerRunning == null
                      ? '—'
                      : hubspotWorkerRunning
                        ? 'Yes'
                        : 'No'}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground">Sync allowed</p>
                  <p className="font-semibold">
                    {hubspotSyncAllowed == null
                      ? '—'
                      : hubspotSyncAllowed
                        ? 'On'
                        : 'Off'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Manual batch sync
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Entity type</Label>
                  <Select
                    value={batchEntityType}
                    onValueChange={(v) =>
                      setBatchEntityType(
                        v as 'all' | HubspotEntityType
                      )
                    }
                  >
                    <SelectTrigger className="w-[170px] h-9 text-xs">
                      <SelectValue placeholder="Entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="institution">Institutions only</SelectItem>
                      <SelectItem value="staff">Staff only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="batch-limit" className="text-xs">
                    Max to sync now
                  </Label>
                  <input
                    id="batch-limit"
                    type="number"
                    min={1}
                    max={1000}
                    value={batchLimit}
                    onChange={(e) =>
                      setBatchLimit(
                        Number.isNaN(Number(e.target.value))
                          ? 100
                          : Number(e.target.value)
                      )
                    }
                    className="h-9 w-28 rounded-md border border-border bg-background px-2 text-xs"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="gap-2"
                  onClick={handleRunBatch}
                  disabled={runningBatch}
                >
                  {runningBatch ? 'Running…' : 'Run batch HubSpot sync'}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Batch sync respects the current HubSpot sync toggle. If sync is
                disabled, the operation is effectively a no-op.
              </p>
            </div>
          </CardContent>
        )}
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
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/60 text-xs text-muted-foreground">
            <div>
              Showing{' '}
              <span className="font-medium text-foreground">{pageStart}</span>–
              <span className="font-medium text-foreground">{pageEnd}</span> of{' '}
              <span className="font-medium text-foreground">{total}</span> jobs
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canPrev || isLoading}
                onClick={() => handlePageChange(offset - pageSize)}
              >
                Previous
              </Button>
              <span className="text-[11px]">
                Page{' '}
                <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
                <span className="font-semibold text-foreground">{totalPages}</span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canNext || isLoading}
                onClick={() => handlePageChange(offset + pageSize)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
