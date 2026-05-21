import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import {
  createICP,
  deleteICPs,
  getICPs,
  getICPsPaginated,
  getICPDetails,
  updateICP,
  ICPsResponse,
  ICPDetails,
} from './icps.service';
import { ICP } from '@/types/icps';

// Re-export types so components don't need to import from service files
export type { ICP, ICPsResponse, ICPDetails };

export const useGetICPs = () =>
  useQuery({
    queryKey: ['icps'],
    queryFn: () => getICPs(),
  });

export function useICPsPaginated(limit: number = 10) {
  const searchParams = useSearchParams();
  const rawOffset = searchParams.get('offset');
  const parsed = rawOffset ? parseInt(rawOffset, 10) : 0;
  const offset = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;

  return useQuery<ICPsResponse, Error>({
    queryKey: ['icps', 'paginated', offset, limit],
    queryFn: () => getICPsPaginated(offset, limit),
    staleTime: 30 * 1000,
  });
}

/** Fires only when icpId is non-null. Cached per ICP. */
export function useICPDetails(icpId: string | null) {
  return useQuery<ICPDetails, Error>({
    queryKey: ['icps', 'details', icpId],
    queryFn: () => getICPDetails(icpId!),
    enabled: !!icpId,
    staleTime: 30 * 1000,
  });
}

export function useCreateICPs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createICP,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['icps'] }),
  });
}

export function useDeleteICPs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteICPs,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['icps'] }),
  });
}

export function useUpdateICP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ICP> }) =>
      updateICP(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['icps'] }),
  });
}
