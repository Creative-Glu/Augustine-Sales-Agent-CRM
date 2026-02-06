import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { ChartBarSquareIcon } from '@heroicons/react/24/outline';
import ExecutionDashboardClient from './_components/ExecutionDashboardClient';

export default function ExecutionDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <Header
        title="Execution Dashboard"
        subtitle="Catholic PDF extraction — websites and company data from the pipeline."
        icon={<ChartBarSquareIcon className="w-6 h-6 text-white" />}
        showLive={true}
      />

      <div className="mt-6 px-1">
        <Suspense
          fallback={
            <div className="bg-card rounded-xl border border-border shadow-sm p-10 flex items-center justify-center min-h-[320px]">
              <div className="animate-pulse text-sm text-muted-foreground font-medium">Loading dashboard…</div>
            </div>
          }
        >
          <ExecutionDashboardClient />
        </Suspense>
      </div>
    </div>
  );
}
