'use client';

import { CreateButton } from '@/components/CreateButton';
import { PageHeader } from '@/components/PageHeader';
import { useProductOffers } from '@/services/product-offers/useProductOffers';
import ProductOfferTable from './ProductOffersTable';
import React from 'react';
import ProductOfferModal from './ProductOfferModal';
import { ProductOffer } from '@/types/product-offer';
import { Info, PackageOpen } from 'lucide-react';

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

  const count = productOffers?.length ?? 0;
  const isEmpty = !isLoading && !isError && count === 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        <div className="p-6 space-y-5">
          <PageHeader
            title="Product Offers"
            subtitle={
              isLoading
                ? 'Loading product offers…'
                : `${count} ${count === 1 ? 'offer' : 'offers'} configured`
            }
          >
            <CreateButton
              label="Create Product Offer"
              onClick={() => setProductOfferModalOpen(true)}
            />
          </PageHeader>

          {/* Info banner — what an offer is, slot rules */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <p className="font-medium mb-1">How product offers work</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                <li>
                  An offer bundles up to <span className="font-semibold">3 products</span> for a
                  specific <span className="font-semibold">ICP</span>, and is referenced by
                  campaigns to decide what gets pitched.
                </li>
                <li>
                  <span className="font-semibold">Product 1 is required.</span> Products 2 and 3
                  are optional — leave them empty if you only want a single-product offer.
                </li>
                <li>
                  Slot order matters: product 1 is the primary pitch, products 2 and 3 act as
                  upsell / cross-sell in outreach copy.
                </li>
                <li>
                  Editing an offer affects every campaign that already references it. Create a new
                  offer instead if you want to A/B test.
                </li>
              </ul>
            </div>
          </div>

          {isEmpty ? (
            <div className="flex flex-col items-center justify-center text-center rounded-lg border border-dashed border-gray-200 bg-gray-50/60 py-12 px-6">
              <div className="rounded-full bg-white border border-gray-200 p-3 mb-3 shadow-sm">
                <PackageOpen className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">No product offers yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-80">
                Create your first offer to pair an ICP with up to three products. Campaigns will
                reference it to decide what to pitch.
              </p>
              <div className="mt-4">
                <CreateButton
                  label="Create your first offer"
                  onClick={() => setProductOfferModalOpen(true)}
                />
              </div>
            </div>
          ) : (
            <ProductOfferTable
              productOffers={productOffers}
              isLoading={isLoading}
              isError={isError}
              fetchProductOffersList={fetchProductOffersList}
              onEdit={handleEdit}
            />
          )}
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
