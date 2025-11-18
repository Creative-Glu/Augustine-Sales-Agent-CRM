'use client';

import { CreateButton } from '@/components/CreateButton';
import { PageHeader } from '@/components/PageHeader';
import { useProductOffers } from '@/services/product-offers/useProductOffers';
import ProductOfferTable from './ProductOffersTable';
import React from 'react';
import CreateProductOfferModal from './CreateProductOfferModal';

const ProductOfferPage = () => {
  const {
    data: productOffers,
    isLoading,
    isError,
    refetch: fetchProductOffersList,
  } = useProductOffers();

  const [isProductOfferModalOpen, setProductOfferModalOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        <div className="p-6">
          <PageHeader
            title="Product Offers"
            subtitle={`Showing ${productOffers?.length} product offers`}
          >
            <CreateButton
              label="Create Product Offer"
              onClick={() => setProductOfferModalOpen(true)}
            />
          </PageHeader>

          <ProductOfferTable
            productOffers={productOffers}
            isLoading={isLoading}
            isError={isError}
            fetchProductOffersList={fetchProductOffersList}
          />
        </div>
      </div>

      <CreateProductOfferModal
        open={isProductOfferModalOpen}
        onClose={() => setProductOfferModalOpen(false)}
        onCreated={fetchProductOffersList}
      />
    </div>
  );
};

export default ProductOfferPage;
