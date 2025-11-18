'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProductOffer,
  deleteProductOffers,
  getProductOffers,
} from './product-offers.service';

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
