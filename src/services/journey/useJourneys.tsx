'use client';

import { useEffect } from 'react';
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
import { Journey } from '@/types/Journey';
import { supabase } from '@/lib/supabaseClient';

export type { ClosedOutcome, MarkClosedOptions };
export type { JourneyFilters, JourneysResponse };

const JOURNEY_QUERY_PREFIX = ['journeys'] as const;

/**
 * Shared realtime hook — subscribes to postgres_changes on the `journeys`
 * table and invalidates the entire `['journeys']` cache prefix on any
 * insert/update/delete. Both useGetJourneys and useJourneysPaginated call
 * this so the UI auto-refreshes when n8n or any other source writes to
 * the journeys table.
 *
 * Channel name is shared because Supabase coalesces same-name subscribers
 * — multiple components mounting at once won't open redundant sockets.
 */
function useJourneysRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('journeys-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journeys' },
        () => {
          queryClient.invalidateQueries({ queryKey: JOURNEY_QUERY_PREFIX });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export const useGetJourneys = (filters: JourneyFilters = {}) => {
  useJourneysRealtime();

  return useQuery<Journey[], Error>({
    queryKey: [...JOURNEY_QUERY_PREFIX, filters],
    queryFn: () => getJourneys(filters),
    staleTime: 30 * 1000,
  });
};

export const useJourneysPaginated = (limit: number = 10, filters: JourneyFilters = {}) => {
  useJourneysRealtime();

  const searchParams = useSearchParams();
  const rawOffset = searchParams.get('offset');
  const parsed = rawOffset ? parseInt(rawOffset, 10) : 0;
  const offset = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;

  return useQuery<JourneysResponse, Error>({
    queryKey: [...JOURNEY_QUERY_PREFIX, 'paginated', offset, limit, filters],
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
