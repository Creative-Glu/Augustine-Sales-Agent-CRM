import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import ExecutionOverviewPage from './_components/ExecutionOverviewPage';

const TABLE_VIEWS = ['institution', 'websites', 'jobs', 'results', 'staff', 'sync-queue'] as const;

export default async function ExecutionDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const view = params.view;
  if (view && TABLE_VIEWS.includes(view as (typeof TABLE_VIEWS)[number])) {
    const rest = new URLSearchParams(params);
    rest.delete('view');
    const q = rest.toString();
    redirect(`/execution-dashboard/${view}${q ? `?${q}` : ''}`);
  }

  return (
    <Suspense
      fallback={
        <div className="bg-card rounded-xl border border-border shadow-sm p-8">
          <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
        </div>
      }
    >
      <ExecutionOverviewPage />
    </Suspense>
  );
}
