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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="space-y-3 mt-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading products. Please try again.</p>
        </div>
      </div>
    );
  }

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

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found.</p>
            </div>
          ) : (
            <ProductsTable products={products} />
          )}
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

