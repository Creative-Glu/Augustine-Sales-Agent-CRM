'use client';

import { Badge } from '@/components/ui/badge';
import type { SyncStatus } from '@/types/execution';

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60_000) return 'Just now';
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
    return d.toLocaleDateString(undefined, { dateStyle: 'short' });
  } catch {
    return iso;
  }
}

/** Color for confidence 0–100: low = muted, mid = default, high = subtle green */
function confidenceVariant(confidence: number | null | undefined): string {
  if (confidence == null) return 'bg-muted/80 text-muted-foreground';
  if (confidence >= 70) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
  if (confidence >= 40) return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
  return 'bg-muted/80 text-muted-foreground';
}

function syncStatusVariant(status: SyncStatus | null | undefined): 'secondary' | 'destructive' | 'outline' {
  if (status === 'success') return 'secondary';
  if (status === 'failed') return 'destructive';
  return 'outline';
}

export interface SyncStatusBadgesProps {
  /** 0–100 or null */
  enrichmentConfidence?: number | null;
  isEligible?: boolean | null;
  syncedToHubspot?: boolean | null;
  syncStatus?: SyncStatus | null;
  webhookStatus?: string | null;
  lastSyncedAt?: string | null;
  /** When true, show "Low Confidence" badge (is_eligible = false). */
  showLowConfidence?: boolean;
  /** When true, show "Ready for Sync" (is_eligible && !synced_to_hubspot). */
  showReadyForSync?: boolean;
  className?: string;
}

export function SyncStatusBadges({
  enrichmentConfidence,
  isEligible,
  syncedToHubspot,
  syncStatus,
  webhookStatus,
  lastSyncedAt,
  showLowConfidence = true,
  showReadyForSync = true,
  className = '',
}: SyncStatusBadgesProps) {
  const numConf = enrichmentConfidence != null ? Number(enrichmentConfidence) : NaN;
  const confidenceValid = !Number.isNaN(numConf) && numConf >= 0;
  const confidenceValue = confidenceValid ? String(enrichmentConfidence) : '—';

  const pipe = <span className="text-muted-foreground/50 px-0.5" aria-hidden>·</span>;

  /** Label: value pair for consistent pipeline readability */
  const Field = ({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) => (
    <span>
      <span className="font-medium text-foreground/80">{label}:</span>{' '}
      <span className={valueClassName ?? 'tabular-nums'}>{value}</span>
    </span>
  );

  return (
    <div className={`flex flex-wrap items-center gap-x-0 gap-y-1 text-xs text-muted-foreground ${className}`}>
      <Field
        label="Enrichment confidence"
        value={confidenceValue}
        valueClassName={`tabular-nums ${confidenceValid ? confidenceVariant(numConf) : ''}`}
      />
      {pipe}
      <Field label="Eligible" value={isEligible === true ? 'Yes' : isEligible === false ? 'No' : '—'} />
      {pipe}
      <Field label="HubSpot" value={syncedToHubspot === true ? 'Yes' : syncedToHubspot === false ? 'No' : '—'} />
      {pipe}
      <span>
        <span className="font-medium text-foreground/80">Sync:</span>{' '}
        {syncStatus != null && syncStatus !== undefined ? (
          <Badge variant={syncStatusVariant(syncStatus)} className="text-xs font-normal">
            {syncStatus}
          </Badge>
        ) : (
          <span>—</span>
        )}
      </span>
      {pipe}
      <Field
        label="Webhook"
        value={webhookStatus != null && String(webhookStatus).trim() !== '' ? String(webhookStatus) : '—'}
      />
      {pipe}
      <Field label="Synced" value={formatRelativeTime(lastSyncedAt)} />
      {showLowConfidence && isEligible === false && (
        <>
          {pipe}
          <span className="text-amber-600 dark:text-amber-400">Low confidence</span>
        </>
      )}
      {showReadyForSync && isEligible === true && syncedToHubspot !== true && (
        <>
          {pipe}
          <span className="text-emerald-600 dark:text-emerald-400">Ready for sync</span>
        </>
      )}
    </div>
  );
}
