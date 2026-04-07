import { Suspense } from 'react';
import { TrendingUp, BarChart3, Zap } from 'lucide-react';
import DashboardGrid from './_components/DashboardGrid';
import DashboardLoader from './_components/DashboardLoader';
import JourneyFunnelChart from './_components/JourneyFunnelChart';
import { Header } from '@/components/Header';
import LoadingPage from '@/app/loading';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <Header
        title="Dashboard Overview"
        subtitle="Quick insights into your CRM performance"
        icon={<BarChart3 className="w-6 h-6 text-white" />}
        showLive={true}
      />

      <div className="px-6 py-8">
        <Suspense fallback={<LoadingPage />}>
          <div className="space-y-8">
            {/* Dashboard Grid Section */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Key Metrics
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                  <div className=" dark:bg-slate-800 rounded-2xl  dark:border-slate-700 overflow-hidden">
                    <DashboardGrid />
                  </div>
                </div>
              </div>
            </div>

            {/* Journey Funnel Chart Section */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Customer Journey
                </h2>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden p-6">
                <Suspense fallback={<DashboardLoader />}>
                  <JourneyFunnelChart />
                </Suspense>
              </div>
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
