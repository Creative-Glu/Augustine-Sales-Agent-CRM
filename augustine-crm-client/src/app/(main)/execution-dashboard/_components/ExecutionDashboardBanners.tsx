'use client';

import { useHubspotHealth } from '@/hooks/useHubspotHealth';

export default function ExecutionDashboardBanners() {
  const { data, isLoading } = useHubspotHealth();

  if (isLoading || !data) return null;

  const { enabled, worker_running } = data;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 px-1">
      <span
        className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium"
        style={{
          borderColor: enabled ? 'var(--muted-foreground / 0.3)' : 'var(--muted-foreground / 0.4)',
          backgroundColor: enabled ? 'hsl(var(--muted) / 0.5)' : 'hsl(var(--muted) / 0.6)',
          color: 'hsl(var(--muted-foreground))',
        }}
      >
        {enabled ? 'HubSpot Sync Active' : 'Staging Mode'}
      </span>
      {!enabled && (
        <span
          className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 px-2.5 py-1 text-xs text-amber-800 dark:text-amber-200"
          role="status"
        >
          HubSpot Sync Disabled
        </span>
      )}
      {enabled && !worker_running && (
        <span
          className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 px-2.5 py-1 text-xs text-amber-800 dark:text-amber-200"
          role="status"
        >
          HubSpot Worker Not Running
        </span>
      )}
    </div>
  );
}
