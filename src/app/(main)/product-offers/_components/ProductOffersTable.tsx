'use client';

import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { useState } from 'react';
import { useToastHelpers } from '@/lib/toast';
import { DeleteButton, EditButton } from '@/components/ActionButtons';
import { TableHeader } from '@/components/TableHeader';
import { PRODUCT_OFFER_COLUMNS } from '@/constants';
import { useDeleteProductOffers, ProductOffer } from '@/services/product-offers/useProductOffers';

type ProductOfferRow = ProductOffer & {
  icp?: { icp_id: string; icp_name: string } | null;
  offer_1_product?: { product_id: string; product_name: string } | null;
  offer_2_product?: { product_id: string; product_name: string } | null;
  offer_3_product?: { product_id: string; product_name: string } | null;
};

function formatCreatedAt(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface ProductsOfferProps {
  productOffers: ProductOfferRow[];
  isLoading: boolean;
  isError: boolean;
  fetchProductOffersList: () => void;
  onEdit?: (offer: ProductOffer) => void;
}

export default function ProductOfferTable({
  productOffers,
  isLoading,
  isError,
  fetchProductOffersList,
  onEdit,
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
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  <div className="animate-pulse text-sm">Loading product offers...</div>
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-red-500">
                  Failed to load product offers. Please try again.
                </td>
              </tr>
            )}

            {!isLoading && !isError && productOffers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  No product offers found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              productOffers.map((offer) => (
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
                    <ol className="flex flex-col gap-1.5 text-sm text-card-foreground">
                      {[
                        offer.offer_1_product?.product_name,
                        offer.offer_2_product?.product_name,
                        offer.offer_3_product?.product_name,
                      ].map((name, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[11px] font-semibold text-muted-foreground shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-snug">{name || '—'}</span>
                        </li>
                      ))}
                    </ol>
                  </td>

                  {/* Created At */}
                  <td className="py-4 px-4 text-sm text-muted-foreground tabular-nums">
                    {formatCreatedAt(offer.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <EditButton onClick={() => onEdit?.(offer)} />
                      <DeleteButton onDelete={() => openDeleteDialog(offer.offer_id)} />
                    </div>
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
