'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProductOffer,
  deleteProductOffers,
  getProductOffers,
  updateProductOffer,
} from './product-offers.service';
import { ProductOffer } from '@/types/product-offer';

export type { ProductOffer };

export function useProductOffers() {
  return useQuery<any, Error>({
    queryKey: ['product-offers'],
    queryFn: getProductOffers,
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
