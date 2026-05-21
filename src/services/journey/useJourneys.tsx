'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import {
  getJourneys,
  getJourneysPaginated,
  deleteJourney,
  markJourneyClosed,
  ClosedOutcome,
  MarkClosedOptions,
  JourneyFilters,
  JourneysResponse,
} from './journey.service';

export type { ClosedOutcome, MarkClosedOptions };
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

interface MarkJourneyClosedArgs {
  journeyId: string;
  outcome: ClosedOutcome;
  options?: MarkClosedOptions;
}

/**
 * Mutation hook that manually flips a journey to Closed-Won or Closed-Lost
 * and writes a log entry. Invalidates both the journeys list and the
 * activity logs for that journey so the UI updates immediately.
 */
export const useMarkJourneyClosed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['mark-journey-closed'],
    mutationFn: ({ journeyId, outcome, options }: MarkJourneyClosedArgs) =>
      markJourneyClosed(journeyId, outcome, options),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      queryClient.invalidateQueries({
        queryKey: ['journey-logs', variables.journeyId],
      });
    },
  });
};

export const useDeleteJourney = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-journey'],
    mutationFn: (journeyId: string) => deleteJourney(journeyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
    },
  });
};
