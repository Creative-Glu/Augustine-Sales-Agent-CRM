import { MEETING_DOT_PALETTE, MEETINGS_CSV_HEADERS } from '@/constants/meetings';
import type { Meeting } from '@/types/meeting';

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Local YYYY-MM-DD key, used to group meetings by calendar day. */
export function localDayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function formatDayHeader(dateKey: string): string {
  return new Date(dateKey).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Lowercase short time (e.g. "3:45 pm") for compact row display. */
export function formatRowTime(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase();
}

/** Meeting length in whole minutes (never negative). */
export function durationMinutes(meeting: Meeting): number {
  const ms = new Date(meeting.end_at).getTime() - new Date(meeting.start_at).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

/** Group meetings by their start date (local time, YYYY-MM-DD key). */
export function groupMeetingsByDay(
  meetings: Meeting[]
): { dateKey: string; items: Meeting[] }[] {
  const map = new Map<string, Meeting[]>();
  meetings.forEach((m) => {
    const key = localDayKey(m.start_at);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  });
  return Array.from(map.entries()).map(([dateKey, items]) => ({ dateKey, items }));
}

/**
 * Deterministic dot color from invitee email/name so each invitee gets a
 * consistent colored dot (similar to Calendly).
 */
export function meetingDotColor(meeting: Meeting): string {
  const seed = (meeting.invitee_email || meeting.invitee_name || meeting.id) ?? '';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return MEETING_DOT_PALETTE[hash % MEETING_DOT_PALETTE.length];
}

/** Build a CSV blob from the given meetings and trigger a browser download. */
export function downloadMeetingsCsv(meetings: Meeting[], filenameTag: string): void {
  if (meetings.length === 0) return;
  const headers = [...MEETINGS_CSV_HEADERS];
  const rows = meetings.map((m) =>
    headers
      .map((h) => {
        const v = (m as unknown as Record<string, unknown>)[h];
        const s = v == null ? '' : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meetings-${filenameTag}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
