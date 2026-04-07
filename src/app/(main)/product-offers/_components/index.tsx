'use client';

import { CreateButton } from '@/components/CreateButton';
import { PageHeader } from '@/components/PageHeader';
import { useProductOffers } from '@/services/product-offers/useProductOffers';
import ProductOfferTable from './ProductOffersTable';
import React from 'react';
import ProductOfferModal from './ProductOfferModal';
import { ProductOffer } from '@/types/product-offer';

const ProductOfferPage = () => {
  const {
    data: productOffers,
    isLoading,
    isError,
    refetch: fetchProductOffersList,
  } = useProductOffers();

  const [isProductOfferModalOpen, setProductOfferModalOpen] = React.useState(false);
  const [selectedOffer, setSelectedOffer] = React.useState<ProductOffer | null>(null);

  const handleEdit = (offer: ProductOffer) => {
    setSelectedOffer(offer);
    setProductOfferModalOpen(true);
  };

  const handleCloseModal = () => {
    setProductOfferModalOpen(false);
    setSelectedOffer(null);
  };

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
            onEdit={handleEdit}
          />
        </div>
      </div>

      <ProductOfferModal
        open={isProductOfferModalOpen}
        onClose={handleCloseModal}
        onCreated={fetchProductOffersList}
        offer={selectedOffer}
      />
    </div>
  );
};

export default ProductOfferPage;
