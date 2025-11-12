import { Suspense } from 'react';
import DashboardGrid from './_components/DashboardGrid';
import DashboardLoader from './_components/DashboardLoader';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purplecrm-800">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Quick insights into your CRM performance.</p>
      </div>

      <Suspense fallback={<DashboardLoader />}>
        <DashboardGrid />
      </Suspense>
    </div>
  );
}
