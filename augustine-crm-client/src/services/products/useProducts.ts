'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import {
  getProducts,
  getProductsPaginated,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
  ProductsResponse,
} from './product.service';

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

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}
