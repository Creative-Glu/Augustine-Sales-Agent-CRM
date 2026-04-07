'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Shared pagination hook for execution dashboard pages.
 * Reads offset/limit from URL search params and provides helpers
 * for computing pagination state and changing the per-page size.
 */
export function usePaginationParams(defaultLimit = DEFAULT_LIMIT) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = pathname ?? '/';

  const rawLimit = searchParams.get('limit');
  const rawOffset = searchParams.get('offset');
  const limit = rawLimit ? Math.min(Math.max(1, parseInt(rawLimit, 10) || defaultLimit), MAX_LIMIT) : defaultLimit;
  const offset = rawOffset ? Math.max(0, parseInt(rawOffset, 10) || 0) : 0;

  const setLimit = useCallback(
    (newLimit: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('limit', String(newLimit));
      params.delete('offset');
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, basePath]
  );

  /** Compute pagination metadata from the total count. */
  function paginationMeta(total: number) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.floor(offset / limit) + 1;
    const hasMore = offset + limit < total;
    const showPagination = total > limit;
    return { totalPages, currentPage, hasMore, showPagination };
  }

  return { offset, limit, setLimit, basePath, searchParams, paginationMeta };
}
