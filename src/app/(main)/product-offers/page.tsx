import { Suspense } from 'react';
import ProductOfferPage from './_components';
import { SquareChartGanttIcon } from 'lucide-react';
import { Header } from '@/components/Header';

const Page = () => {
  return (
    <div>
      <Header
        title="Product Offers"
        subtitle=" View, manage, and organize all Product Offers linked with ICPs and Products."
        icon={<SquareChartGanttIcon className="w-6 h-6 text-white" />}
        showLive={true}
      />
      <div className="mt-5">
        <Suspense fallback={<h1>Loading...</h1>}>
          <ProductOfferPage />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
