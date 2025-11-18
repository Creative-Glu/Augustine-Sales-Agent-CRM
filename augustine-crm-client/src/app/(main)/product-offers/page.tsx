import { Suspense } from 'react';
import ProductOfferPage from './_components';

const Page = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Product Offers</h1>
        <p className="text-muted-foreground mt-1">
          View, manage, and organize all Product Offers linked with ICPs and Products.
        </p>
      </div>

      <Suspense fallback={<h1>Loading...</h1>}>
        <ProductOfferPage />
      </Suspense>
    </div>
  );
};

export default Page;
