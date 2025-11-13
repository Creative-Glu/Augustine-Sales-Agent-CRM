import { Suspense } from 'react';
import ProductsList from './_components/ProductsList';
import ProductsLoader from './_components/ProductsLoader';

export default function ProductsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground mt-1">Manage and view all your products.</p>
      </div>

      <Suspense fallback={<ProductsLoader />}>
        <ProductsList />
      </Suspense>
    </div>
  );
}
