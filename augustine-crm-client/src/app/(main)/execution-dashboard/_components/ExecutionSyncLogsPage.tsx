'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useSyncLogs } from '@/services/execution/useExecutionData';
import type { SyncLogEntry } from '@/services/execution/staff.service';
import { useToastHelpers } from '@/lib/toast';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

async function triggerSyncRetry(type: 'staff' | 'institution', id: number | string): Promise<void> {
  const res = await fetch('/api/sync-retry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, id }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? `Retry failed: ${res.status}`);
  }
}

const COLUMNS = [
  { label: 'Type', align: 'left' as const },
  { label: 'Name', align: 'left' as const },
  { label: 'Sync error', align: 'left' as const },
  { label: 'Webhook attempts', align: 'right' as const },
  { label: 'Last synced', align: 'left' as const },
  { label: 'Actions', align: 'left' as const },
];

export default function ExecutionSyncLogsPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10) || 0);
  const syncLogsQuery = useSyncLogs(offset);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const { successToast, errorToast } = useToastHelpers();

  const handleRetry = async (entry: SyncLogEntry) => {
    const key = `${entry.type}-${entry.id}`;
    setRetryingId(key);
    try {
      await triggerSyncRetry(entry.type, entry.id);
      successToast('Retry requested. Data will refresh shortly.');
      await Promise.all([
        syncLogsQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ['execution', 'sync-logs'] }),
        queryClient.invalidateQueries({ queryKey: ['execution', 'staff'] }),
        queryClient.invalidateQueries({ queryKey: ['execution', 'institution'] }),
        queryClient.invalidateQueries({ queryKey: ['execution', 'stats'] }),
      ]);
    } catch (e) {
      errorToast(e instanceof Error ? e.message : 'Retry failed');
    } finally {
      setRetryingId(null);
    }
  };

  const data = syncLogsQuery.data?.data ?? [];
  const total = syncLogsQuery.data?.total ?? 0;
  const isLoading = syncLogsQuery.isLoading;
  const isError = syncLogsQuery.isError;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Sync logs</CardTitle>
          <p className="text-sm text-muted-foreground">
            Institution and staff records with sync state. Use Retry to trigger a sync attempt.
          </p>
        </CardHeader>
      </Card>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap py-4 border-b border-border/60">
            <p className="text-sm text-muted-foreground font-medium">
              Showing <span className="text-foreground">{data.length}</span> of{' '}
              <span className="text-foreground">{total}</span> records
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => syncLogsQuery.refetch()}
              disabled={isLoading}
            >
              <ArrowPathIcon className="w-4 h-4 shrink-0" />
              Refresh
            </Button>
          </div>

          <div className="w-full rounded-lg border border-border overflow-hidden">
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
                      <td colSpan={COLUMNS.length} className="py-12 text-center text-muted-foreground text-sm">
                        Loading sync logs…
                      </td>
                    </tr>
                  )}
                  {isError && (
                    <tr>
                      <td colSpan={COLUMNS.length} className="py-12 text-center text-destructive text-sm">
                        Failed to load.{' '}
                        <button
                          type="button"
                          onClick={() => syncLogsQuery.refetch()}
                          className="underline font-medium ml-1 hover:no-underline"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isError && data.length === 0 && (
                    <tr>
                      <td colSpan={COLUMNS.length} className="py-12 text-center text-muted-foreground text-sm">
                        No sync log entries.
                      </td>
                    </tr>
                  )}
                  {!isLoading &&
                    !isError &&
                    data.map((row) => {
                      const key = `${row.type}-${row.id}`;
                      return (
                        <tr
                          key={key}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="capitalize text-muted-foreground">{row.type}</span>
                          </td>
                          <td className="py-3 px-4 font-medium text-foreground">{row.name}</td>
                          <td className="py-3 px-4 text-muted-foreground max-w-[280px] truncate" title={row.sync_error ?? ''}>
                            {row.sync_error ?? '—'}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums text-muted-foreground">
                            {row.webhook_attempts ?? '—'}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {formatDate(row.last_synced_at)}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetry(row)}
                              disabled={retryingId === key}
                            >
                              {retryingId === key ? 'Retrying…' : 'Retry'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
