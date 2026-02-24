'use client';

import { Badge } from '@/components/ui/badge';
import type { SyncStatus } from '@/types/execution';

interface ExecutionStatusCardProps {
  syncStatus?: SyncStatus | null;
  isEligible?: boolean | null;
  syncedToHubspot?: boolean | null;
  enrichmentConfidence?: number | null;
  webhookStatus?: string | null;
  lastSyncedAt?: string | null;
}

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return 'Not available';
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60_000) return 'Just now';
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
    return d.toLocaleString();
  } catch {
    return 'Not available';
  }
}

function displayOrNA(value: string | null | undefined): string {
  const v = value?.trim();
  return v && v.length > 0 ? v : 'Not available';
}

function getSyncBadgeVariant(status: SyncStatus | null | undefined): { className: string; label: string } {
  if (!status) return { className: 'bg-muted text-muted-foreground', label: 'Not available' };
  if (status === 'success') {
    return {
      className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      label: 'Success',
    };
  }
  if (status === 'failed') {
    return {
      className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
      label: 'Failed',
    };
  }
  return {
    className: 'bg-muted text-muted-foreground border-border/60',
    label: 'Pending',
  };
}

function getEligibilityBadge(isEligible: boolean | null | undefined): { label: string; className: string } {
  if (isEligible === true) {
    return {
      label: 'Eligible',
      className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    };
  }
  if (isEligible === false) {
    return {
      label: 'Low confidence',
      className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    };
  }
  return { label: 'Not available', className: 'bg-muted text-muted-foreground border-border/60' };
}

function getHubspotBadge(synced: boolean | null | undefined): { label: string; className: string } {
  if (synced === true) {
    return {
      label: 'Managed in HubSpot',
      className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
    };
  }
  if (synced === false) {
    return {
      label: 'Not synced',
      className: 'bg-muted text-muted-foreground border-border/60',
    };
  }
  return { label: 'Not available', className: 'bg-muted text-muted-foreground border-border/60' };
}

function getConfidenceDisplay(raw: number | null | undefined): { label: string; className: string } {
  if (raw == null || Number.isNaN(Number(raw)) || raw < 0) {
    return { label: 'Not available', className: 'text-muted-foreground' };
  }
  const n = Number(raw);
  const asPercent = n <= 1 ? n * 100 : n;
  const rounded = Math.round(asPercent);
  const label = `${rounded}%`;
  if (rounded >= 80) {
    return {
      label,
      className: 'text-emerald-700 dark:text-emerald-400',
    };
  }
  if (rounded >= 50) {
    return {
      label,
      className: 'text-amber-700 dark:text-amber-400',
    };
  }
  return {
    label,
    className: 'text-red-700 dark:text-red-400',
  };
}

function getWebhookBadge(status: string | null | undefined): { label: string; className: string } {
  const value = status?.toLowerCase().trim();
  if (!value) return { label: 'Not available', className: 'bg-muted text-muted-foreground border-border/60' };
  if (value === 'failed' || value === 'error') {
    return {
      label: 'Failed',
      className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
    };
  }
  if (value === 'success' || value === 'sent') {
    return {
      label: 'Sent',
      className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    };
  }
  if (value === 'pending') {
    return {
      label: 'Pending',
      className: 'bg-muted text-muted-foreground border-border/60',
    };
  }
  return { label: status ?? 'Not available', className: 'bg-muted text-muted-foreground border-border/60' };
}

export function ExecutionStatusCard({
  syncStatus,
  isEligible,
  syncedToHubspot,
  enrichmentConfidence,
  webhookStatus,
  lastSyncedAt,
}: ExecutionStatusCardProps) {
  const hasAnyData =
    syncStatus != null ||
    isEligible != null ||
    syncedToHubspot != null ||
    (enrichmentConfidence != null && !Number.isNaN(Number(enrichmentConfidence))) ||
    (webhookStatus != null && webhookStatus.trim() !== '') ||
    !!lastSyncedAt;

  if (!hasAnyData) {
    return (
      <div className="w-full sm:w-[260px] lg:w-[300px] rounded-xl border border-dashed border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium">Status:</span> <span className="ml-1">Not enriched yet</span>
      </div>
    );
  }

  const syncBadge = getSyncBadgeVariant(syncStatus ?? null);
  const eligibility = getEligibilityBadge(isEligible ?? null);
  const hubspot = getHubspotBadge(syncedToHubspot ?? null);
  const confidence = getConfidenceDisplay(enrichmentConfidence);
  const webhook = getWebhookBadge(webhookStatus ?? null);

  return (
    <div className="w-full sm:w-[260px] lg:w-[300px] rounded-xl border border-border bg-muted/30 px-3 py-2 shadow-sm">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-xs">
        <div className="text-muted-foreground">Sync status</div>
        <div>
          <Badge variant="outline" className={`h-5 px-2 text-[11px] font-medium border ${syncBadge.className}`}>
            {syncBadge.label}
          </Badge>
        </div>

        <div className="text-muted-foreground">Eligibility</div>
        <div>
          <Badge variant="outline" className={`h-5 px-2 text-[11px] font-medium border ${eligibility.className}`}>
            {eligibility.label}
          </Badge>
        </div>

        <div className="text-muted-foreground">HubSpot</div>
        <div>
          <Badge variant="outline" className={`h-5 px-2 text-[11px] font-medium border ${hubspot.className}`}>
            {hubspot.label}
          </Badge>
        </div>

        <div className="text-muted-foreground">Confidence</div>
        <div className={`text-xs font-medium ${confidence.className}`}>{confidence.label}</div>

        <div className="text-muted-foreground">Webhook</div>
        <div>
          <Badge variant="outline" className={`h-5 px-2 text-[11px] font-medium border ${webhook.className}`}>
            {webhook.label}
          </Badge>
        </div>

        <div className="text-muted-foreground">Last sync</div>
        <div className="text-xs font-medium" title={lastSyncedAt ?? undefined}>
          {formatRelativeTime(lastSyncedAt)}
        </div>
      </div>
    </div>
  );
}

