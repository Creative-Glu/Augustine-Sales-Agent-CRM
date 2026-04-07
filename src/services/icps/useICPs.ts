import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createICP, deleteICPs, getICPs, updateICP } from './icps.service';
import { ICP } from '@/types/icps';

// Re-export types so components don't need to import from service files
export type { ICP };

export const useGetICPs = () =>
  useQuery({
    queryKey: ['icps'],
    queryFn: () => getICPs(),
  });

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
