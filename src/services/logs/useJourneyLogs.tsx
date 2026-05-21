'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getLogsForJourney } from './log.service';
import { JourneyLog } from '@/types/log';
import { supabase } from '@/lib/supabaseClient';

export type { JourneyLog };

interface UseJourneyLogsResult {
  data: JourneyLog[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isLive: boolean;
  refetch: () => void;
}

export function useJourneyLogs(journeyId: string | null): UseJourneyLogsResult {
  const queryClient = useQueryClient();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!journeyId) {
      setIsLive(false);
      return;
    }

    const channel = supabase
      .channel(`logs-realtime-${journeyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'logs',
          filter: `journey_id=eq.${journeyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['journey-logs', journeyId] });
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsLive(false);
    };
  }, [journeyId, queryClient]);

  const query = useQuery<JourneyLog[], Error>({
    queryKey: ['journey-logs', journeyId],
    queryFn: () =>
      journeyId ? getLogsForJourney(journeyId) : Promise.resolve([] as JourneyLog[]),
    enabled: !!journeyId,
    staleTime: 30 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isLive,
    refetch: query.refetch,
  };
}
