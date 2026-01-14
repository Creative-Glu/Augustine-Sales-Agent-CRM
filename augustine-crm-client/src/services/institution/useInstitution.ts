'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { getFileNameCounts, getFileNameCountsPaginated, FileNameCount, FileNameCountsResponse } from './institution.service';

export function useFileNameCounts() {
  return useQuery<FileNameCount[], Error>({
    queryKey: ['institution', 'file-name-counts'],
    queryFn: getFileNameCounts,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useFileNameCountsPaginated(limit: number = 10) {
  const searchParams = useSearchParams();
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
  const validOffset = isNaN(offset) || offset < 0 ? 0 : offset;

  return useQuery<FileNameCountsResponse, Error>({
    queryKey: ['institution', 'file-name-counts', 'paginated', validOffset, limit],
    queryFn: () => getFileNameCountsPaginated(validOffset, limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export type { FileNameCount, FileNameCountsResponse };
