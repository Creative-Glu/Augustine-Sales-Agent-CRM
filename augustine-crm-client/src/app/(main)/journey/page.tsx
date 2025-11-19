import { Suspense } from 'react';
import JourneyPage from './_components';
import LeadJourneyDashboard from './_components/LeadJourneyDashboard';

export default function DashboardPage() {
  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Lead Journey</h1>
        <p className="text-muted-foreground mt-1">
          Visualize the journey of your leads across different stages in the CRM. Track progress
          from initial outreach to conversion.
        </p>
      </div>

      {/* Chart */}
      <Suspense fallback={<h2 className="text-gray-500">Loading Lead Journey Chart...</h2>}>
        <JourneyPage />
      </Suspense>
    </div>
  );
}
