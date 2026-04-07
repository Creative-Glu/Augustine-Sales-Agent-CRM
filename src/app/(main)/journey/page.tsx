import { Suspense } from 'react';
import JourneyPage from './_components';
import { SquareChartGanttIcon } from 'lucide-react';
import { Header } from '@/components/Header';

export default function DashboardPage() {
  return (
    <div className="">
      <Header
        title="Lead Journey"
        subtitle="Visualize the journey of your leads across different stages in the CRM. Track progress
          from initial outreach to conversion."
        icon={<SquareChartGanttIcon className="w-6 h-6 text-white" />}
        showLive={true}
      />

      <div className="mt-5">
        {' '}
        <Suspense fallback={<h2 className="text-gray-500">Loading Lead Journey Chart...</h2>}>
          <JourneyPage />
        </Suspense>
      </div>
    </div>
  );
}
