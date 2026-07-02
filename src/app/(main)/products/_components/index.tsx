'use client';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Pagination from '@/components/Pagination';
import { useProductsPaginated, Product } from '@/services/products/useProducts';
import ProductsTable from './ProductsTable';
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CreateButton } from '@/components/CreateButton';

const ProductModal = dynamic(() => import('./ProductModal'), { ssr: false });
const ProductViewModal = dynamic(() => import('./ProductViewModal'), { ssr: false });

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const limit = 10;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
  const validOffset = isNaN(offset) || offset < 0 ? 0 : offset;

  const { data, isLoading, isError, refetch: fetchProductsList } = useProductsPaginated(limit);

  const { products, total, hasMore } = data || { products: [], total: 0, hasMore: false };
  const currentPage = Math.floor(validOffset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  const [isProductModalOpen, setProductModalOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = React.useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
  };

  const handleCloseModal = () => {
    setProductModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border shadow-md overflow-hidden">
        <div className="p-6">
          <PageHeader title="Products" subtitle={`Showing ${products.length} of ${total} products`}>
            <CreateButton label="Create Product" onClick={() => setProductModalOpen(true)} />
          </PageHeader>

          <ProductsTable
            products={products}
            isLoading={isLoading}
            isError={isError}
            fetchProductsList={fetchProductsList}
            onEdit={handleEdit}
            onView={handleView}
          />
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

      <ProductModal
        open={isProductModalOpen}
        onClose={handleCloseModal}
        onCreated={fetchProductsList}
        product={selectedProduct}
      />

      <ProductViewModal
        open={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
      />
    </div>
  );
}
