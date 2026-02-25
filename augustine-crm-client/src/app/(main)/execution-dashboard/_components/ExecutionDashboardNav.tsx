'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getViewFromPathname } from '@/services/execution/useExecutionData';
import type { ExecutionView } from '@/services/execution/useExecutionData';

const VIEW_LABELS: Record<ExecutionView, string> = {
  overview: 'Overview',
  institution: 'Institutions',
  websites: 'Website URLs',
  jobs: 'Jobs',
  results: 'Results',
  staff: 'Staff',
  'sync-queue': 'Sync Queue',
};

const VIEW_PATHS: Record<ExecutionView, string> = {
  overview: '/execution-dashboard',
  institution: '/execution-dashboard/institution',
  websites: '/execution-dashboard/websites',
  jobs: '/execution-dashboard/jobs',
  results: '/execution-dashboard/results',
  staff: '/execution-dashboard/staff',
  'sync-queue': '/execution-dashboard/sync-queue',
};

export default function ExecutionDashboardNav() {
  const pathname = usePathname();
  const currentView = getViewFromPathname(pathname);

  return (
    <nav
      className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl border border-border/60 bg-muted/60 dark:bg-muted/30 shadow-sm mb-6"
      aria-label="Execution dashboard sections"
    >
      {(Object.keys(VIEW_LABELS) as ExecutionView[]).map((view) => {
        const href = VIEW_PATHS[view];
        const isActive = currentView === view;
        return (
          <Link
            key={view}
            href={href}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-background shadow-sm border border-border/60 text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {VIEW_LABELS[view]}
          </Link>
        );
      })}
    </nav>
  );
}
