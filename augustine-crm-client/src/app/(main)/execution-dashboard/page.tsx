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

      <div className="mt-5">
        <Suspense
          fallback={
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-8">
              <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
            </div>
          }
        >
          <ExecutionDashboardClient />
        </Suspense>
      </div>
    </div>
  );
}
