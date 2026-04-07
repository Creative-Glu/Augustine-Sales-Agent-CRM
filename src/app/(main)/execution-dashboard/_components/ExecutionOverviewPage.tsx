'use client';

import { useExecutionStats } from '@/services/execution/useExecutionData';
import ExecutionKpiDashboard from './ExecutionKpiDashboard';

export default function ExecutionOverviewPage() {
  const statsQuery = useExecutionStats();

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-6">
        <ExecutionKpiDashboard
          stats={statsQuery.stats}
          recentJobs={statsQuery.recentJobs}
          recentFailedResults={statsQuery.recentFailedResults}
          isLoading={statsQuery.isLoading}
          isRecentJobsLoading={statsQuery.isRecentJobsLoading}
          isRecentFailedResultsLoading={statsQuery.isRecentFailedResultsLoading}
          isError={statsQuery.isError}
          onRetry={statsQuery.refetch}
        />
      </div>
    </div>
  );
}
