'use client';

import { Header } from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { getHubspotHealth } from '@/services/augustine/hubspot.service';
import { Badge } from '@/components/ui/badge';
import ExecutionSyncQueuePage from '@/app/(main)/execution-dashboard/_components/ExecutionSyncQueuePage';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
];

const ENTITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'institution', label: 'Institution' },
  { value: 'staff', label: 'Staff' },
];

function healthBadge(enabled: boolean, worker: boolean) {
  if (!enabled) {
    return { label: 'Disabled', className: 'bg-red-500/10 text-red-700 border-red-500/30' };
  }
  if (worker) {
    return { label: 'Running', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' };
  }
  return { label: 'Enabled, worker idle', className: 'bg-amber-500/10 text-amber-700 border-amber-500/30' };
}

export default function HubspotSyncPage() {
  const healthQuery = useQuery({
    queryKey: ['augustine', 'hubspot', 'health'],
    queryFn: getHubspotHealth,
    staleTime: 10_000,
  });

  const enabled = healthQuery.data?.enabled ?? false;
  const workerRunning = healthQuery.data?.worker_running ?? false;
  const hb = healthBadge(enabled, workerRunning);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        title="HubSpot sync & health"
        subtitle="Check HubSpot connectivity and manage sync queue retries."
        icon={<span className="text-white text-lg font-semibold">HS</span>}
        showLive
      />

      <div className="px-6 py-6 space-y-6 max-w-6xl mx-auto">
        <section className="bg-card rounded-xl border border-border shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">HubSpot status</p>
            <p className="text-xs text-muted-foreground">
              Enabled flag and worker status from <code className="text-[11px]">/api/hubspot-health</code>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`border px-3 py-1 text-xs ${hb.className}`}>
              {hb.label}
            </Badge>
            {healthQuery.isLoading && (
              <span className="text-xs text-muted-foreground">Checking health…</span>
            )}
          </div>
        </section>

        <section>
          <ExecutionSyncQueuePage />
        </section>
      </div>
    </div>
  );
}

