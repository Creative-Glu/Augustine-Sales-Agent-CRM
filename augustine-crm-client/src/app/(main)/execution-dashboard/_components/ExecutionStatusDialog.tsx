'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { SyncStatus } from '@/types/execution';
import { ExecutionStatusCard } from './ExecutionStatusCard';

interface ExecutionStatusDialogProps {
  entityLabel: string;
  syncStatus?: SyncStatus | null;
  isEligible?: boolean | null;
  syncedToHubspot?: boolean | null;
  enrichmentConfidence?: number | null;
  webhookStatus?: string | null;
  lastSyncedAt?: string | null;
}

export function ExecutionStatusDialog({
  entityLabel,
  syncStatus,
  isEligible,
  syncedToHubspot,
  enrichmentConfidence,
  webhookStatus,
  lastSyncedAt,
}: ExecutionStatusDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-0 text-xs text-primary hover:text-primary hover:bg-transparent underline underline-offset-2"
        >
          View sync pipeline
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl md:max-w-5xl w-[96vw]">
        <DialogHeader>
          <DialogTitle>Sync pipeline</DialogTitle>
          <DialogDescription className="text-xs">
            Current HubSpot pipeline state for <span className="font-medium text-foreground">{entityLabel}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-6">
          {/* Simple step view for continuity */}
          <div className="space-y-3">
            <ol className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <div>
                  <div className="font-medium text-foreground">Enrichment</div>
                  <p className="text-muted-foreground">
                    Confidence and eligibility derived from enrichment pass and rules.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <div>
                  <div className="font-medium text-foreground">Eligibility</div>
                  <p className="text-muted-foreground">
                    Record must be marked eligible before it can be promoted to HubSpot.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <div>
                  <div className="font-medium text-foreground">HubSpot sync</div>
                  <p className="text-muted-foreground">
                    Once eligible, the record is synced to HubSpot and managed there as the source of truth.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <div>
                  <div className="font-medium text-foreground">Webhooks</div>
                  <p className="text-muted-foreground">
                    Delivery to downstream systems is tracked via webhook status and attempts.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Compact card with live values */}
          <div className="md:border-l md:border-border md:pl-4">
            <ExecutionStatusCard
              syncStatus={syncStatus}
              isEligible={isEligible}
              syncedToHubspot={syncedToHubspot}
              enrichmentConfidence={enrichmentConfidence}
              webhookStatus={webhookStatus}
              lastSyncedAt={lastSyncedAt}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

