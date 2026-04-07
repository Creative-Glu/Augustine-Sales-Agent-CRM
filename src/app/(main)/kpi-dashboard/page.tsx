import { Suspense } from 'react';
import { KPIDashboard } from './_components/KPIDashboard';
import ProductsLoader from '../products/_components/ProductsLoader';
import { BarChart3, Zap } from 'lucide-react';
import { Header } from '@/components/Header';
import LoadingPage from '@/app/loading';

export default function KPIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <Header
        title="KPI Dashboard"
        subtitle="Overview of key metrics and funnel stage analytics."
        icon={<BarChart3 className="w-6 h-6 text-white" />}
        showLive={true}
      />

      <Suspense fallback={<LoadingPage />}>
        <KPIDashboard />
      </Suspense>
    </div>
  );
}
