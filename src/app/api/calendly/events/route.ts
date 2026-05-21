/**
 * Server-side proxy to the Calendly API.
 *
 * Frontend calls /api/calendly/events?range=upcoming|past&count=50
 * and we add the bearer token here so the token never reaches the
 * browser. Docs:
 *   - https://developer.calendly.com/api-docs
 *   - https://developer.calendly.com/api-docs/d5a3c1f5e3a4d-list-events
 *   - https://developer.calendly.com/api-docs/EXPa4WeRq19a7-list-event-invitees
 */

import { NextRequest, NextResponse } from 'next/server';

const CALENDLY_API_BASE = 'https://api.calendly.com';

// Match the CRM's internal Meeting shape so the UI can stay source-agnostic.
type MeetingStatus = 'scheduled' | 'canceled' | 'rescheduled' | 'completed';

interface MeetingDTO {
  id: string;
  external_id: string;
  source: 'calendly';
  start_at: string;
  end_at: string;
  invitee_name: string | null;
  invitee_email: string | null;
  event_type: string | null;
  status: MeetingStatus;
  host_count: number;
  non_host_count: number;
  lead_id: number | null;
  journey_id: string | null;
  campaign_id: number | null;
  meeting_url: string | null;
  notes: string | null;
}

interface CalendlyEvent {
  uri: string;
  name?: string | null;
  status: 'active' | 'canceled';
  start_time: string;
  end_time: string;
  event_type?: string;
  location?: {
    type?: string;
    location?: string;
    join_url?: string;
  } | null;
  event_memberships?: { user?: string }[];
  event_guests?: unknown[];
}

interface CalendlyInvitee {
  uri: string;
  email?: string | null;
  name?: string | null;
  status: string;
  rescheduled?: boolean;
}

interface CalendlyListResponse<T> {
  collection: T[];
  pagination?: {
    count?: number;
    next_page?: string | null;
  };
}

async function calendlyFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${CALENDLY_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Calendly ${path} failed: ${res.status} ${body}`);
  }
  return res.json() as Promise<T>;
}

async function resolveUserUri(token: string, envUri?: string): Promise<string> {
  if (envUri && envUri.startsWith('https://api.calendly.com/users/')) {
    return envUri;
  }
  const me = await calendlyFetch<{ resource: { uri: string } }>(
    '/users/me',
    token
  );
  return me.resource.uri;
}

function inferStatus(event: CalendlyEvent, invitee?: CalendlyInvitee): MeetingStatus {
  if (event.status === 'canceled') return 'canceled';
  if (invitee?.rescheduled) return 'rescheduled';
  const ended = new Date(event.end_time).getTime() < Date.now();
  if (ended) return 'completed';
  return 'scheduled';
}

async function fetchEventInvitee(
  eventUri: string,
  token: string
): Promise<CalendlyInvitee | null> {
  try {
    // eventUri looks like "https://api.calendly.com/scheduled_events/<UUID>"
    const eventUuid = eventUri.split('/').pop();
    if (!eventUuid) return null;
    const res = await calendlyFetch<CalendlyListResponse<CalendlyInvitee>>(
      `/scheduled_events/${eventUuid}/invitees?count=1`,
      token
    );
    return res.collection[0] ?? null;
  } catch {
    return null;
  }
}

function toMeetingDTO(event: CalendlyEvent, invitee: CalendlyInvitee | null): MeetingDTO {
  const externalId = event.uri.split('/').pop() ?? event.uri;
  const hostCount = event.event_memberships?.length ?? 1;
  const nonHostCount = Array.isArray(event.event_guests)
    ? event.event_guests.length
    : 0;
  return {
    id: externalId,
    external_id: externalId,
    source: 'calendly',
    start_at: event.start_time,
    end_at: event.end_time,
    invitee_name: invitee?.name ?? null,
    invitee_email: invitee?.email ?? null,
    event_type: event.name ?? null,
    status: inferStatus(event, invitee ?? undefined),
    host_count: hostCount,
    non_host_count: nonHostCount,
    lead_id: null,
    journey_id: null,
    campaign_id: null,
    meeting_url: event.location?.join_url ?? null,
    notes: null,
  };
}

export async function GET(req: NextRequest) {
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        meetings: [],
        total: 0,
        configured: false,
        message:
          'Calendly API token is not configured. Set CALENDLY_API_TOKEN in your server environment.',
      },
      { status: 200 }
    );
  }

  const { searchParams } = new URL(req.url);
  const range = (searchParams.get('range') ?? 'upcoming').toLowerCase();
  const startIsoParam = searchParams.get('startIso');
  const endIsoParam = searchParams.get('endIso');
  const countParam = parseInt(searchParams.get('count') ?? '50', 10);
  const count = Number.isFinite(countParam) ? Math.min(Math.max(countParam, 1), 100) : 50;

  // Validate any ISO timestamps the client sent so we don't pass garbage
  // straight to Calendly (which would 400 the whole request).
  const validIso = (s: string | null): string | null => {
    if (!s) return null;
    const t = new Date(s).getTime();
    return Number.isFinite(t) ? new Date(t).toISOString() : null;
  };
  const startIso = validIso(startIsoParam);
  const endIso = validIso(endIsoParam);

  try {
    const userUri = await resolveUserUri(token, process.env.CALENDLY_USER_URI);

    const params = new URLSearchParams();
    params.set('user', userUri);
    params.set('count', String(count));

    // If explicit start/end are provided, they win — drives Calendly's
    // server-side date filter directly. Otherwise fall back to the
    // upcoming/past defaults so the basic tab UI still works.
    if (startIso || endIso) {
      if (startIso) params.set('min_start_time', startIso);
      if (endIso) params.set('max_start_time', endIso);
      // Sort ascending when looking at a forward-looking range
      params.set('sort', startIso ? 'start_time:asc' : 'start_time:desc');
    } else {
      const nowIso = new Date().toISOString();
      if (range === 'past') {
        params.set('max_start_time', nowIso);
        params.set('sort', 'start_time:desc');
      } else {
        params.set('min_start_time', nowIso);
        params.set('sort', 'start_time:asc');
      }
    }

    const events = await calendlyFetch<CalendlyListResponse<CalendlyEvent>>(
      `/scheduled_events?${params.toString()}`,
      token
    );

    // Fetch first invitee in parallel for each event so we have a name + email
    // to display. (Calendly returns invitees as a separate paginated resource.)
    const meetings = await Promise.all(
      events.collection.map(async (event) => {
        const invitee = await fetchEventInvitee(event.uri, token);
        return toMeetingDTO(event, invitee);
      })
    );

    return NextResponse.json(
      {
        meetings,
        total: events.pagination?.count ?? meetings.length,
        configured: true,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { meetings: [], total: 0, configured: true, error: message },
      { status: 500 }
    );
  }
}
