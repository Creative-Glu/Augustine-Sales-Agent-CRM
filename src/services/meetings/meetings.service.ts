import { Meeting } from '@/types/meeting';

export interface MeetingsResponse {
  meetings: Meeting[];
  total: number;
  /** True when the Calendly token isn't configured server-side yet. */
  notConfigured: boolean;
}

interface CalendlyEventsResponse {
  meetings: Meeting[];
  total: number;
  configured: boolean;
  error?: string;
  message?: string;
}

interface FetchOptions {
  range?: 'upcoming' | 'past';
  startIso?: string | null;
  endIso?: string | null;
  count?: number;
}

async function fetchFromApi(opts: FetchOptions): Promise<MeetingsResponse> {
  try {
    const params = new URLSearchParams();
    if (opts.range) params.set('range', opts.range);
    if (opts.startIso) params.set('startIso', opts.startIso);
    if (opts.endIso) params.set('endIso', opts.endIso);
    if (opts.count) params.set('count', String(opts.count));

    const res = await fetch(`/api/calendly/events?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      let detail = '';
      try {
        const body = (await res.json()) as { error?: string };
        detail = body.error ?? '';
      } catch {
        // ignore
      }
      throw new Error(
        `Failed to load Calendly meetings (${res.status})${detail ? ` — ${detail}` : ''}`
      );
    }

    const body = (await res.json()) as CalendlyEventsResponse;
    return {
      meetings: body.meetings ?? [],
      total: body.total ?? 0,
      notConfigured: !body.configured,
    };
  } catch (err) {
    throw err instanceof Error ? err : new Error('fetchFromApi failed');
  }
}

export async function getUpcomingMeetings(limit: number = 50): Promise<MeetingsResponse> {
  return fetchFromApi({ range: 'upcoming', count: limit });
}

export async function getPastMeetings(limit: number = 50): Promise<MeetingsResponse> {
  return fetchFromApi({ range: 'past', count: limit });
}

export async function getMeetingsInRange(
  startIso: string,
  endIso: string,
  limit: number = 100
): Promise<MeetingsResponse> {
  return fetchFromApi({ startIso, endIso, count: limit });
}
