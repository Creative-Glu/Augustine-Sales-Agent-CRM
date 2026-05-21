/**
 * Meeting record — synced from Calendly (or another source like Google
 * Calendar) into the `public.meetings` Supabase table by n8n.
 *
 * Run this once in the Supabase SQL editor to create the table:
 *
 *   create table public.meetings (
 *     id uuid primary key default gen_random_uuid(),
 *     external_id text not null,
 *     source text not null default 'calendly',
 *     start_at timestamptz not null,
 *     end_at timestamptz not null,
 *     invitee_name text,
 *     invitee_email text,
 *     event_type text,
 *     status text not null default 'scheduled',
 *     host_count integer not null default 1,
 *     non_host_count integer not null default 0,
 *     lead_id integer references public."Augustine 10"(id) on delete set null,
 *     journey_id uuid references public.journeys(journey_id) on delete set null,
 *     campaign_id integer references public.campaigns(campaign_id) on delete set null,
 *     meeting_url text,
 *     notes text,
 *     raw jsonb,
 *     created_at timestamptz default now(),
 *     updated_at timestamptz default now(),
 *     unique (source, external_id)
 *   );
 *
 *   alter publication supabase_realtime add table public.meetings;
 */
export type MeetingStatus = 'scheduled' | 'canceled' | 'rescheduled' | 'completed';

export interface Meeting {
  id: string;
  external_id: string;
  source: string;
  start_at: string;
  end_at: string;
  invitee_name?: string | null;
  invitee_email?: string | null;
  event_type?: string | null;
  status: MeetingStatus;
  host_count: number;
  non_host_count: number;
  lead_id?: number | null;
  journey_id?: string | null;
  campaign_id?: number | null;
  meeting_url?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
