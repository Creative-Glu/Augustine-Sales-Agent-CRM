import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import ExecutionInstitutionPage from '../_components/ExecutionInstitutionPage';
import ExecutionWebsitesPage from '../_components/ExecutionWebsitesPage';
import ExecutionJobsPage from '../_components/ExecutionJobsPage';
import ExecutionResultsPage from '../_components/ExecutionResultsPage';
import ExecutionStaffPage from '../_components/ExecutionStaffPage';
import ExecutionSyncQueuePage from '../_components/ExecutionSyncQueuePage';
import { EXECUTION_VIEWS, type ExecutionViewSegment } from '@/constants/execution';

function isValidView(view: string): view is ExecutionViewSegment {
  return EXECUTION_VIEWS.includes(view as ExecutionViewSegment);
}

interface ExecutionViewPageProps {
  params: Promise<{ view: string }>;
}

export default async function ExecutionViewPage({ params }: ExecutionViewPageProps) {
  const { view } = await params;

  if (!isValidView(view)) {
    redirect('/execution-dashboard');
  }

  const ViewComponent = {
    institution: ExecutionInstitutionPage,
    websites: ExecutionWebsitesPage,
    jobs: ExecutionJobsPage,
    results: ExecutionResultsPage,
    staff: ExecutionStaffPage,
    'sync-queue': ExecutionSyncQueuePage,
  }[view];

  return (
    <Suspense
      fallback={
        <div className="bg-card rounded-xl border border-border shadow-sm p-8">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <ViewComponent />
    </Suspense>
  );
}
