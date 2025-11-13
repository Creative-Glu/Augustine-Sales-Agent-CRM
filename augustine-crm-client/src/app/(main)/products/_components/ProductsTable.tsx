'use client';

import { Product } from '@/src/services/products/useProducts';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatPrice, formatDate } from '@/src/utils/format';

interface ProductsTableProps {
  products: Product[];
}

export default function ProductsTable({ products }: ProductsTableProps) {

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-card-foreground">
              Product Name
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-card-foreground">
              Pricing Type
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-card-foreground">
              Price
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-card-foreground">
              Created At
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-card-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.product_id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="font-medium text-card-foreground">{product.product_name}</div>
                {product.product_description && (
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {product.product_description}
                  </div>
                )}
              </td>
              <td className="py-4 px-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {product.pricing_type || 'N/A'}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm font-semibold text-card-foreground">
                  {formatPrice(product.price, product.pricing_type)}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-muted-foreground">{formatDate(product.created_at)}</div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center p-2 text-muted-foreground border border-gray-200 rounded-lg bg-white cursor-not-allowed opacity-60 hover:bg-gray-50 transition-colors"
                    title="Edit"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center p-2 text-red-500 border border-red-200 rounded-lg bg-white cursor-not-allowed opacity-60 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

