'use client';

import { Badge } from '@/components/ui/badge';
import type { SyncStatus } from '@/types/execution';

// ─── Shared sync / queue badge renderers ──────────────────────────────────
// Previously duplicated in StaffTable.tsx and InstitutionTable.tsx.

const SYNC_STATUS_STYLES: Record<string, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  failed: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
  processing: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  default: 'border-border/60 bg-muted text-muted-foreground',
};

function getStatusStyle(status: string | null | undefined): string {
  return SYNC_STATUS_STYLES[status ?? ''] ?? SYNC_STATUS_STYLES.default;
}

export function SmallSyncBadge({ status }: { status: SyncStatus | null | undefined }) {
  if (!status) {
    return <span className="text-xs text-muted-foreground">Sync: Not available</span>;
  }
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <span>Sync:</span>
      <Badge variant="outline" className={`h-5 px-2 text-[11px] font-medium border ${getStatusStyle(status)}`}>
        {status}
      </Badge>
    </span>
  );
}

export function QueueBadge({
  syncStatus,
  syncedToHubspot,
}: {
  syncStatus: SyncStatus | null | undefined;
  syncedToHubspot: boolean | null | undefined;
}) {
  if (syncStatus === 'success' || syncedToHubspot === true) {
    return (
      <Badge variant="outline" className={`h-5 px-2 text-[11px] font-medium border ${SYNC_STATUS_STYLES.success}`}>
        Synced
      </Badge>
    );
  }
  if (syncStatus === 'pending') {
    return (
      <Badge variant="outline" className={`h-5 px-2 text-[11px] font-medium border ${SYNC_STATUS_STYLES.pending}`}>
        Queued
      </Badge>
    );
  }
  if (syncStatus === 'processing') {
    return (
      <Badge variant="outline" className={`h-5 px-2 text-[11px] font-medium border ${SYNC_STATUS_STYLES.processing}`}>
        Processing
      </Badge>
    );
  }
  if (syncStatus === 'failed') {
    return (
      <Badge variant="outline" className={`h-5 px-2 text-[11px] font-medium border ${SYNC_STATUS_STYLES.failed}`}>
        Failed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={`h-5 px-2 text-[11px] font-medium border ${SYNC_STATUS_STYLES.default}`}>
      Not queued
    </Badge>
  );
}

/** Status badge class for sync queue table (returns className string). */
export function syncQueueStatusClass(status: string | null | undefined): string {
  return getStatusStyle(status);
}
