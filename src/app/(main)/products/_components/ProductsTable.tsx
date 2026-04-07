'use client';

import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { Product, useDeleteProduct } from '@/services/products/useProducts';
import { formatDate, formatPrice } from '@/utils/format';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { pricingTypeConfig } from '@/constants/pricing-types';
import { useToastHelpers } from '@/lib/toast';
import { DeleteButton, EditButton } from '@/components/ActionButtons';
import { TableHeader } from '@/components/TableHeader';
import { PRODUCT_TABLE_COLUMNS } from '@/constants';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  fetchProductsList: () => void;
  onEdit?: (product: Product) => void;
}

export default function ProductsTable({
  products,
  isLoading,
  isError,
  fetchProductsList,
  onEdit,
}: ProductsTableProps) {
  const { successToast, errorToast } = useToastHelpers();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const openDeleteDialog = (productId: string) => {
    setSelectedProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProductId) return;
    try {
      setIsDeleteDialogOpen(false);
      await deleteProduct(selectedProductId);
      successToast('Product Deleted successfully!');
    } catch (error) {
      errorToast('failed to delete');
    }

    fetchProductsList();
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader columns={PRODUCT_TABLE_COLUMNS} />

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  <div className="animate-pulse text-sm">Loading products...</div>
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-red-500">
                  Failed to load products. Please try again.
                </td>
              </tr>
            )}

            {!isLoading && !isError && products.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  No products found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              products.map((product) => (
                <tr
                  key={product.product_id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-card-foreground">{product.product_name}</div>

                    {/* {product.product_description && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {product.product_description}
                      </div>
                    )} */}
                  </td>

                  <td className="py-4 px-4">
                    {(() => {
                      const type = product.pricing_type?.toLowerCase() || 'default';
                      const config = pricingTypeConfig[type] || pricingTypeConfig['default'];

                      return (
                        <Badge
                          variant="outline"
                          className={`
          flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
          ${config.color}
        `}
                        >
                          {config.icon}
                          {product.pricing_type || 'N/A'}
                        </Badge>
                      );
                    })()}
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-sm font-semibold text-card-foreground">
                      {formatPrice(product.price, product.pricing_type)}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(product.created_at)}
                    </div>
                  </td>

                  <td className="py-4 px-4 flex items-center justify-center gap-2">
                    <EditButton onClick={() => onEdit?.(product)} />
                    <DeleteButton onDelete={() => openDeleteDialog(product.product_id)} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
        title="Delete Product"
        description="Are you sure you want to delete this product?"
        onConfirm={handleConfirmDelete}
        loading={isLoading}
      />
    </div>
  );
}
