'use client';

import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToastHelpers } from '@/lib/toast';
import { DeleteButton, EditButton, ViewButton } from '@/components/ActionButtons';
import { TableHeader } from '@/components/TableHeader';
import { PRODUCT_OFFER_COLUMNS } from '@/constants';
import {
  useDeleteProductOffers,
  ProductOffer,
} from '@/services/product-offers/useProductOffers';
import { formatDateTimeShort } from '@/utils/format';
import { PackageOpen, AlertCircle } from 'lucide-react';

type ProductOfferRow = ProductOffer & {
  created_at?: string | null;
  icp?: { icp_id: string; icp_name: string; icp_desc?: string | null } | null;
  offer_1_product?: { product_id: string; product_name: string } | null;
  offer_2_product?: { product_id: string; product_name: string } | null;
  offer_3_product?: { product_id: string; product_name: string } | null;
};

interface ProductsOfferProps {
  productOffers: ProductOfferRow[];
  isLoading: boolean;
  isError: boolean;
  fetchProductOffersList: () => void;
  onEdit?: (offer: ProductOffer) => void;
  onView?: (offer: ProductOfferRow) => void;
}

export default function ProductOfferTable({
  productOffers,
  isLoading,
  isError,
  fetchProductOffersList,
  onEdit,
  onView,
}: ProductsOfferProps) {
  const { successToast, errorToast } = useToastHelpers();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductOfferId, setSelectedProductOfferId] = useState<string | null>(null);

  const { mutateAsync: deleteProductOffers, isPending: isDeleting } =
    useDeleteProductOffers();

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
    } catch (err) {
      const detail = err instanceof Error ? err.message : '';
      errorToast(`Failed to delete product offer${detail ? ` — ${detail}` : ''}`);
    }
    fetchProductOffersList();
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <TableHeader columns={PRODUCT_OFFER_COLUMNS} />

          <tbody>
            {/* ── Loading ── */}
            {isLoading && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td colSpan={5} className="py-2 px-3">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* ── Error ── */}
            {!isLoading && isError && (
              <tr>
                <td colSpan={5} className="py-8">
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    <p className="text-sm font-medium text-rose-700">
                      Failed to load product offers
                    </p>
                    <button
                      type="button"
                      onClick={fetchProductOffersList}
                      className="text-xs font-medium text-rose-600 hover:text-rose-800 underline"
                    >
                      Try again
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* ── Empty ── */}
            {!isLoading && !isError && productOffers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8">
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                      <PackageOpen className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs font-medium text-slate-700">
                      No product offers found
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* ── Rows ── */}
            {!isLoading &&
              !isError &&
              productOffers.map((offer) => {
                const products = [
                  offer.offer_1_product?.product_name,
                  offer.offer_2_product?.product_name,
                  offer.offer_3_product?.product_name,
                ];
                const filledCount = products.filter(Boolean).length;

                return (
                  <tr
                    key={offer.offer_id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Offer Name + ID */}
                    <td className="py-2 px-3 min-w-0">
                      <p
                        className="font-medium text-sm text-slate-900 truncate max-w-60"
                        title={offer.offer_name}
                      >
                        {offer.offer_name || '—'}
                      </p>
                      <p
                        className="text-[10px] font-mono text-slate-500 truncate"
                        title={offer.offer_id}
                      >
                        {offer.offer_id}
                      </p>
                    </td>

                    {/* ICP */}
                    <td className="py-2 px-3">
                      {offer.icp?.icp_name ? (
                        <span
                          className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 max-w-40 truncate"
                          title={offer.icp.icp_name}
                        >
                          {offer.icp.icp_name}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No ICP</span>
                      )}
                    </td>

                    {/* Products — compact, color-coded slot dots */}
                    <td className="py-2 px-3">
                      <ol className="space-y-1">
                        {products.map((name, i) => {
                          const slotColor =
                            i === 0
                              ? 'bg-emerald-500'
                              : i === 1
                                ? 'bg-blue-500'
                                : 'bg-violet-500';
                          return (
                            <li
                              key={i}
                              className="flex items-center gap-1.5 text-[11px] leading-snug"
                            >
                              <span
                                aria-label={`Slot ${i + 1}`}
                                className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                                  name ? slotColor : 'bg-slate-300'
                                }`}
                              />
                              <span
                                className={`truncate max-w-50 ${
                                  name
                                    ? 'text-slate-700'
                                    : 'text-slate-400 italic'
                                }`}
                                title={name ?? ''}
                              >
                                {name || 'Empty'}
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {filledCount}/3 slots filled
                      </p>
                    </td>

                    {/* Created At */}
                    <td className="py-2 px-3 text-[11px] text-slate-500 tabular-nums whitespace-nowrap">
                      {formatDateTimeShort(offer.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <ViewButton onClick={() => onView?.(offer)} />
                        <EditButton onClick={() => onEdit?.(offer)} />
                        <DeleteButton
                          onDelete={() => openDeleteDialog(offer.offer_id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
        title="Delete Product Offer"
        description="Are you sure you want to delete this product offer? Campaigns that reference it may stop working."
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
