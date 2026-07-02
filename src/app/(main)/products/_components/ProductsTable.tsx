'use client';

import { Product } from '@/services/products/useProducts';
import { formatDateTimeShort, formatPrice } from '@/utils/format';
import { Badge } from '@/components/ui/badge';
import { pricingTypeConfig } from '@/constants/pricing-types';
import { EditButton, ViewButton } from '@/components/ActionButtons';
import { TableHeader } from '@/components/TableHeader';
import { PRODUCT_TABLE_COLUMNS } from '@/constants';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  fetchProductsList: () => void;
  onEdit?: (product: Product) => void;
  onView?: (product: Product) => void;
}

export default function ProductsTable({
  products,
  isLoading,
  isError,
  onEdit,
  onView,
}: ProductsTableProps) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <TableHeader columns={PRODUCT_TABLE_COLUMNS} />

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  <div className="animate-pulse text-xs">Loading products...</div>
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-red-500 text-xs">
                  Failed to load products. Please try again.
                </td>
              </tr>
            )}

            {!isLoading && !isError && products.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground text-xs">
                  No products found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              products.map((product) => {
                const pricingKey = product.pricing_type?.toLowerCase() || 'default';
                const pricingCfg =
                  pricingTypeConfig[pricingKey] || pricingTypeConfig['default'];
                return (
                  <tr
                    key={product.product_id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    {/* Name + description */}
                    <td className="py-2 px-3">
                      <div className="font-medium text-card-foreground text-sm truncate">
                        {product.product_name}
                      </div>
                      {product.product_description && (
                        <div
                          className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-90"
                          title={product.product_description}
                        >
                          {product.product_description}
                        </div>
                      )}
                    </td>

                    {/* Pricing type badge */}
                    <td className="py-2 px-3">
                      <Badge
                        variant="outline"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${pricingCfg.color}`}
                      >
                        {pricingCfg.icon}
                        {product.pricing_type || 'N/A'}
                      </Badge>
                    </td>

                    {/* Price */}
                    <td className="py-2 px-3">
                      <div className="text-xs font-semibold text-card-foreground tabular-nums">
                        {formatPrice(product.price, product.pricing_type)}
                      </div>
                    </td>

                    {/* Created date + time */}
                    <td className="py-2 px-3">
                      <div className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatDateTimeShort(product.created_at)}
                      </div>
                    </td>

                    {/* Actions — delete button intentionally hidden from this table */}
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <ViewButton onClick={() => onView?.(product)} />
                        <EditButton onClick={() => onEdit?.(product)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
