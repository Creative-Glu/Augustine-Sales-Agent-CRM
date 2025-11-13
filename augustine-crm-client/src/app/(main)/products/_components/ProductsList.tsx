'use client';

import { useSearchParams } from 'next/navigation';
import Pagination from '@/src/components/Pagination';
import { useProductsPaginated } from '@/src/services/products/useProducts';
import ProductsTable from './ProductsTable';

export default function ProductsList() {
  const searchParams = useSearchParams();
  const limit = 10;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
  const validOffset = isNaN(offset) || offset < 0 ? 0 : offset;

  const { data, isLoading, isError } = useProductsPaginated(limit);

  const { products, total, hasMore } = data || { products: [], total: 0, hasMore: false };
  const currentPage = Math.floor(validOffset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">Products</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {products.length} of {total} products
            </p>
          </div>
          <ProductsTable products={products} isLoading={isLoading} isError={isError} />
        </div>
      </div>

      {total > limit && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          currentOffset={validOffset}
          limit={limit}
          hasMore={hasMore}
          basePath="/products"
          queryParamName="offset"
        />
      )}
    </div>
  );
}
