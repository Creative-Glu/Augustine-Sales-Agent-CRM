'use client';

import { useQuery } from '@tanstack/react-query';
import type { HubSpotHealth } from '@/types/execution';

async function fetchHubspotHealth(): Promise<HubSpotHealth> {
  const res = await fetch('/api/hubspot-health', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch HubSpot health');
  return res.json();
}

export function useHubspotHealth() {
  return useQuery({
    queryKey: ['hubspot-health'],
    queryFn: fetchHubspotHealth,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
