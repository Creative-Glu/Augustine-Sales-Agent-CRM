'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import {
  getJourneys,
  getJourneysPaginated,
  JourneyFilters,
  JourneysResponse,
} from './journey.service';
import { Journey } from '@/types/Journey';

export type { JourneyFilters, JourneysResponse };

export const useGetJourneys = (filters: JourneyFilters = {}) => {
  return useQuery<Journey[], Error>({
    queryKey: ['journeys', filters],
    queryFn: () => getJourneys(filters),
    staleTime: 30 * 1000,
  });
};

export const useJourneysPaginated = (limit: number = 10, filters: JourneyFilters = {}) => {
  const searchParams = useSearchParams();
  const rawOffset = searchParams.get('offset');
  const parsed = rawOffset ? parseInt(rawOffset, 10) : 0;
  const offset = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;

  return useQuery<JourneysResponse, Error>({
    queryKey: ['journeys', 'paginated', offset, limit, filters],
    queryFn: () => getJourneysPaginated(offset, limit, filters),
    staleTime: 30 * 1000,
  });
};
