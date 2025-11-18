'use client';

import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { useState } from 'react';
import { useToastHelpers } from '@/lib/toast';
import { DeleteButton, EditButton } from '@/components/ActionButtons';
import { TableHeader } from '@/components/TableHeader';
import { PRODUCT_OFFER_COLUMNS } from '@/constants';
import { useDeleteProductOffers } from '@/services/product-offers/useProductOffers';

interface ProductsOfferProps {
  productOffers: any;
  isLoading: boolean;
  isError: boolean;
  fetchProductOffersList: () => void;
}

export default function ProductOfferTable({
  productOffers,
  isLoading,
  isError,
  fetchProductOffersList,
}: ProductsOfferProps) {
  const { successToast, errorToast } = useToastHelpers();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductOfferId, setSelectedProductOfferId] = useState<string | null>(null);

  const { mutateAsync: deleteProductOffers } = useDeleteProductOffers();

  const openDeleteDialog = (offerId: string) => {
    setSelectedProductOfferId(offerId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProductOfferId) return;

    try {
      setIsDeleteDialogOpen(false);
      await deleteProductOffers(selectedProductOfferId);
      successToast('Product offer deleted successfully!');
    } catch (error) {
      errorToast('Failed to delete product offer.');
    }

    fetchProductOffersList();
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader columns={PRODUCT_OFFER_COLUMNS} />

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  <div className="animate-pulse text-sm">Loading product offers...</div>
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-red-500">
                  Failed to load product offers. Please try again.
                </td>
              </tr>
            )}

            {!isLoading && !isError && productOffers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No product offers found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              productOffers.map((offer: any) => (
                <tr
                  key={offer.offer_id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Offer Name */}
                  <td className="py-4 px-4">
                    <div className="font-medium text-card-foreground">{offer.offer_name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Offer ID: {offer.offer_id}
                    </div>
                  </td>

                  {/* ICP */}
                  <td className="py-4 px-4">
                    <div className="text-sm font-semibold">{offer.icp?.icp_name}</div>
                  </td>

                  {/* Products */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1 text-sm text-card-foreground">
                      <span>{offer.offer_1_product?.product_name || '—'}</span>
                      <span>{offer.offer_2_product?.product_name || '—'}</span>
                      <span>{offer.offer_3_product?.product_name || '—'}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 flex items-center gap-2">
                    <EditButton />
                    <DeleteButton onDelete={() => openDeleteDialog(offer.offer_id)} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
        title="Delete Product Offer"
        description="Are you sure you want to delete this product offer?"
        onConfirm={handleConfirmDelete}
        loading={isLoading}
      />
    </div>
  );
}
