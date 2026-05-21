'use client';

import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProductOffer,
  deleteProductOffers,
  getProductOffers,
  getProductOffersPaginated,
  updateProductOffer,
  ProductOffersResponse,
} from './product-offers.service';
import { ProductOffer } from '@/types/product-offer';

export type { ProductOffer, ProductOffersResponse };

export function useProductOffers() {
  return useQuery<any, Error>({
    queryKey: ['product-offers'],
    queryFn: getProductOffers,
  });
}

/**
 * Server-side paginated product offers. Reads `?offset=` from the URL so
 * pages are bookmarkable. Invalidated by any product-offer mutation since
 * all hooks share the `['product-offers']` cache prefix.
 */
export function useProductOffersPaginated(limit: number = 10) {
  const searchParams = useSearchParams();
  const rawOffset = searchParams.get('offset');
  const parsed = rawOffset ? parseInt(rawOffset, 10) : 0;
  const offset = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;

  return useQuery<ProductOffersResponse, Error>({
    queryKey: ['product-offers', 'paginated', offset, limit],
    queryFn: () => getProductOffersPaginated(offset, limit),
    staleTime: 30 * 1000,
  });
}
export function useDeleteProductOffers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProductOffers(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-offers'] });
    },
  });
}
export function useCreateProductOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductOffer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-offers'] }),
  });
}

export function useUpdateProductOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['update-product-offer'],
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ProductOffer> }) =>
      updateProductOffer(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-offers'] }),
  });
}
