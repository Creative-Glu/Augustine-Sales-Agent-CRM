'use client';

import type { SyncStatus } from '@/types/execution';
import { ExecutionStatusCard } from './ExecutionStatusCard';

interface ExecutionStatusPipelinePanelProps {
  entityLabel: string;
  syncStatus?: SyncStatus | null;
  isEligible?: boolean | null;
  syncedToHubspot?: boolean | null;
  enrichmentConfidence?: number | null;
  webhookStatus?: string | null;
  lastSyncedAt?: string | null;
  onClose?: () => void;
}

/** Small panel attached below the button: pipeline explanation + current status. */
export function ExecutionStatusPipelinePanel({
  entityLabel,
  syncStatus,
  isEligible,
  syncedToHubspot,
  enrichmentConfidence,
  webhookStatus,
  lastSyncedAt,
  onClose,
}: ExecutionStatusPipelinePanelProps) {
  return (
    <div className="w-[280px] max-w-[min(280px,100%)] rounded-md border border-border bg-background p-2.5 shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-1">
        <span className="text-[11px] font-medium text-muted-foreground">Pipeline · {entityLabel}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        )}
      </div>
      <ol className="space-y-1.5 text-[11px] text-muted-foreground">
        <li><span className="font-medium text-foreground">1. Enrichment</span> — Score 0–100%, readiness for HubSpot.</li>
        <li><span className="font-medium text-foreground">2. Eligibility</span> — Must be eligible to sync.</li>
        <li><span className="font-medium text-foreground">3. HubSpot</span> — Synced = managed there.</li>
        <li><span className="font-medium text-foreground">4. Webhook</span> — Send status (pending/sent/failed).</li>
      </ol>
      <div className="mt-2 border-t border-border/60 pt-2">
        <ExecutionStatusCard
          compact
          syncStatus={syncStatus}
          isEligible={isEligible}
          syncedToHubspot={syncedToHubspot}
          enrichmentConfidence={enrichmentConfidence}
          webhookStatus={webhookStatus}
          lastSyncedAt={lastSyncedAt}
        />
      </div>
    </div>
  );
}
