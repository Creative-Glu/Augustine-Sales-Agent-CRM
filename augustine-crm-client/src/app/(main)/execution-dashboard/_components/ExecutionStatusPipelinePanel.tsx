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

/** Compact panel (main things only, no scrollbar) attached above or below the link. */
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
    <div className="w-[280px] max-w-[min(280px,100%)] overflow-hidden rounded-md border border-border bg-background p-2.5 shadow-lg">
      <div className="mb-1.5 flex items-center justify-between gap-1">
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
      <p className="text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">1. Enrichment</span> → <span className="font-medium text-foreground">2. Eligibility</span> → <span className="font-medium text-foreground">3. HubSpot</span> → <span className="font-medium text-foreground">4. Webhook</span>
      </p>
      <div className="mt-1.5 border-t border-border/60 pt-1.5">
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
