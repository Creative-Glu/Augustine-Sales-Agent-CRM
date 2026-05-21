'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getUpcomingMeetings,
  getPastMeetings,
  getMeetingsInRange,
  MeetingsResponse,
} from './meetings.service';

export type { MeetingsResponse };

const MEETINGS_PREFIX = ['meetings'] as const;

// Polling cadence — Calendly doesn't push to the browser, so we poll the
// proxy route every 30 seconds while the page is active to stay fresh.
const POLL_INTERVAL_MS = 30_000;

export function useUpcomingMeetings(limit: number = 50) {
  return useQuery<MeetingsResponse, Error>({
    queryKey: [...MEETINGS_PREFIX, 'upcoming', limit],
    queryFn: () => getUpcomingMeetings(limit),
    staleTime: 15_000,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}

export function usePastMeetings(limit: number = 50) {
  return useQuery<MeetingsResponse, Error>({
    queryKey: [...MEETINGS_PREFIX, 'past', limit],
    queryFn: () => getPastMeetings(limit),
    staleTime: 60_000,
    refetchInterval: POLL_INTERVAL_MS * 2,
    refetchOnWindowFocus: true,
  });
}

interface UseMeetingsInRangeArgs {
  startIso: string | null;
  endIso: string | null;
  limit?: number;
  enabled?: boolean;
}

/**
 * Fetches meetings whose start_time falls between startIso (inclusive) and
 * endIso (exclusive). Filtering happens on Calendly's side via
 * min_start_time / max_start_time — no client-side filtering.
 */
export function useMeetingsInRange({
  startIso,
  endIso,
  limit = 100,
  enabled = true,
}: UseMeetingsInRangeArgs) {
  return useQuery<MeetingsResponse, Error>({
    queryKey: [...MEETINGS_PREFIX, 'range', startIso, endIso, limit],
    queryFn: () => getMeetingsInRange(startIso!, endIso!, limit),
    enabled: enabled && !!startIso && !!endIso,
    staleTime: 30_000,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}
