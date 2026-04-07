'use client';

import { useQuery } from '@tanstack/react-query';
import { getWebsitesUrl } from './websitesUrl.service';

export function useWebsitesUrl() {
  return useQuery({
    queryKey: ['websites-url'],
    queryFn: getWebsitesUrl,
    staleTime: 60 * 1000, // 1 minute
  });
}
