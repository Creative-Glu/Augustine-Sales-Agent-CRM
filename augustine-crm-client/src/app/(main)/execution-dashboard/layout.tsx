import { Header } from '@/components/Header';
import { ChartBarSquareIcon } from '@heroicons/react/24/outline';
import ExecutionDashboardNav from './_components/ExecutionDashboardNav';

export default function ExecutionDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <Header
        title="Execution Dashboard"
        subtitle="Catholic PDF extraction — websites and company data from the pipeline."
        icon={<ChartBarSquareIcon className="w-6 h-6 text-white" />}
        showLive={true}
      />

      <div className="mt-5">
        <ExecutionDashboardNav />
        {children}
      </div>
    </div>
  );
}
