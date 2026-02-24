import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import ExecutionInstitutionPage from '../_components/ExecutionInstitutionPage';
import ExecutionWebsitesPage from '../_components/ExecutionWebsitesPage';
import ExecutionJobsPage from '../_components/ExecutionJobsPage';
import ExecutionResultsPage from '../_components/ExecutionResultsPage';
import ExecutionStaffPage from '../_components/ExecutionStaffPage';
import ExecutionSyncLogsPage from '../_components/ExecutionSyncLogsPage';

const VALID_VIEWS = ['institution', 'websites', 'jobs', 'results', 'staff', 'sync-logs'] as const;

type ViewSegment = (typeof VALID_VIEWS)[number];

function isValidView(view: string): view is ViewSegment {
  return VALID_VIEWS.includes(view as ViewSegment);
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
    'sync-logs': ExecutionSyncLogsPage,
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
