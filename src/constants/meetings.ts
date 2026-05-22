/**
 * Static config & lookup tables for the Meetings module.
 * Component files should import from here instead of defining inline literals.
 */

export const CALENDLY_APP_URL = 'https://calendly.com/app/scheduled_events/user/me';

export const MEETINGS_AUTO_REFETCH_MS = 30_000;

export const MEETINGS_DEFAULT_LIMIT = 50;
export const MEETINGS_RANGE_LIMIT = 100;

/** Deterministic accent palette for the colored dot on each meeting row. */
export const MEETING_DOT_PALETTE = [
  '#8b5cf6', // violet (Calendly's default)
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#6366f1', // indigo
] as const;

export type StatusPillTone = 'rose' | 'amber' | 'slate';

export const STATUS_PILL_TONE_CLASSES: Record<StatusPillTone, string> = {
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

export type StatTint = 'emerald' | 'indigo' | 'amber';

export const STAT_TINT_CLASSES: Record<StatTint, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
};

/** Bullet copy for the "How meetings work" info banner. */
export const MEETINGS_HINTS: string[] = [
  'Every row here is a slot booked by a lead or contact through your Calendly link — synced live from your Calendly account.',
  "Use the Upcoming tab to prepare for what's next; the Past tab is your booking history, including canceled / rescheduled meetings.",
  'The list refreshes itself every 30 seconds — click Refresh to pull the latest immediately.',
  "Click any meeting to see the invitee's contact info, the join link, and link back to the related lead / journey once that wiring is in place.",
  'Need to edit slots, availability, or event types? Use Open Calendly in the top-right — those settings live in your Calendly account, not in the CRM.',
];

export const MEETINGS_CSV_HEADERS = [
  'start_at',
  'end_at',
  'invitee_name',
  'invitee_email',
  'event_type',
  'status',
  'meeting_url',
] as const;
