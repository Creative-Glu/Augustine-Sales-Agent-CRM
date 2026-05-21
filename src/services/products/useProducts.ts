'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import {
  getProducts,
  getProductsPaginated,
  getOffersForProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  ProductsResponse,
  AttachedProductOffer,
} from './product.service';
import { Product } from '@/types/product';

export type { AttachedProductOffer };

// Re-export types so components don't need to import from service files
export type { Product, ProductsResponse };

export function useProducts() {
  return useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: getProducts,
  });
}

export function useProductsPaginated(limit: number = 10) {
  const searchParams = useSearchParams();
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
  const validOffset = isNaN(offset) || offset < 0 ? 0 : offset;

  return useQuery<ProductsResponse, Error>({
    queryKey: ['products', 'paginated', validOffset, limit],
    queryFn: () => getProductsPaginated(validOffset, limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      updateProduct(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useOffersForProduct(productId: string | null) {
  return useQuery<AttachedProductOffer[], Error>({
    queryKey: ['products', 'attached-offers', productId],
    queryFn: () =>
      productId ? getOffersForProduct(productId) : Promise.resolve([] as AttachedProductOffer[]),
    enabled: !!productId,
    staleTime: 60 * 1000,
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
