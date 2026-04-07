import { Suspense } from 'react';
import Products from './_components';
import ProductsLoader from './_components/ProductsLoader';
import { Header } from '@/components/Header';
import { SquareChartGantt } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="">
      <Header
        title="Products"
        subtitle="Manage and view all your products."
        icon={<SquareChartGantt className="w-6 h-6 text-white" />}
        showLive={true}
      />

      <div className="mt-5">
        <Suspense fallback={<ProductsLoader />}>
          <Products />
        </Suspense>
      </div>
    </div>
  );
}
