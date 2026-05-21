'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useUpcomingMeetings,
  usePastMeetings,
  useMeetingsInRange,
} from '@/services/meetings/useMeetings';
import type { Meeting } from '@/types/meeting';
import DateRangePicker, { type DateRange } from './DateRangePicker';
import {
  Calendar,
  CalendarDays,
  AlertCircle,
  Inbox,
  RefreshCw,
  ExternalLink,
  Download,
  Info,
} from 'lucide-react';

const MeetingRow = dynamic(() => import('./MeetingRow'), { ssr: false });
const MeetingDetailsModal = dynamic(() => import('./MeetingDetailsModal'), { ssr: false });

type Tab = 'upcoming' | 'past';

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayHeader(dateKey: string): string {
  const d = new Date(dateKey);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Group meetings by their start date (local time, YYYY-MM-DD key). */
function groupByDay(meetings: Meeting[]): { dateKey: string; items: Meeting[] }[] {
  const map = new Map<string, Meeting[]>();
  meetings.forEach((m) => {
    const d = new Date(m.start_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(d.getDate()).padStart(2, '0')}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  });
  return Array.from(map.entries()).map(([dateKey, items]) => ({
    dateKey,
    items,
  }));
}

export default function MeetingsPage() {
  const [tab, setTab] = useState<Tab>('upcoming');
  const [viewing, setViewing] = useState<Meeting | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    preset: 'none',
    startIso: null,
    endIso: null,
  });

  // When a date range is active, all filtering happens on Calendly's side via
  // min_start_time / max_start_time. The tabs become inert in this mode.
  const rangeActive =
    dateRange.preset !== 'none' && !!dateRange.startIso && !!dateRange.endIso;

  const upcoming = useUpcomingMeetings(50);
  const past = usePastMeetings(50);
  const ranged = useMeetingsInRange({
    startIso: dateRange.startIso,
    endIso: dateRange.endIso,
    limit: 100,
    enabled: rangeActive,
  });

  const active = rangeActive ? ranged : tab === 'upcoming' ? upcoming : past;
  const meetings = active.data?.meetings ?? [];
  const total = active.data?.total ?? 0;
  const notConfigured = active.data?.notConfigured ?? false;

  const groups = useMemo(() => groupByDay(meetings), [meetings]);
  const today = useMemo(() => new Date(), []);

  const handleExport = () => {
    if (meetings.length === 0) return;
    const headers = [
      'start_at',
      'end_at',
      'invitee_name',
      'invitee_email',
      'event_type',
      'status',
      'meeting_url',
    ];
    const rows = meetings.map((m) =>
      headers
        .map((h) => {
          const v = (m as unknown as Record<string, unknown>)[h];
          const s = v == null ? '' : String(v);
          // Quote and escape any embedded quotes
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meetings-${tab}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Hints / notes banner */}
      <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-linear-to-br from-violet-50 via-indigo-50/60 to-blue-50/40 px-4 py-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-violet-100 text-violet-600 shrink-0">
          <Info className="w-4 h-4" />
        </span>
        <div className="text-xs text-violet-900 leading-relaxed">
          <p className="font-semibold mb-1">How meetings work</p>
          <ul className="list-disc list-inside space-y-0.5 text-violet-900/85">
            <li>
              Every row here is a <span className="font-semibold">slot booked by a lead or contact</span>{' '}
              through your Calendly link — synced live from your Calendly account.
            </li>
            <li>
              Use the <span className="font-semibold">Upcoming</span> tab to prepare for what&apos;s
              next; the <span className="font-semibold">Past</span> tab is your booking history,
              including canceled / rescheduled meetings.
            </li>
            <li>
              The list refreshes itself every <span className="font-semibold">30 seconds</span> —
              click <span className="font-mono">Refresh</span> to pull the latest immediately.
            </li>
            <li>
              Click any meeting to see the invitee&apos;s contact info, the join link, and link
              back to the related lead / journey once that wiring is in place.
            </li>
            <li>
              Need to edit slots, availability, or event types? Use{' '}
              <span className="font-mono">Open Calendly</span> in the top-right — those settings
              live in your Calendly account, not in the CRM.
            </li>
          </ul>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
                <Calendar className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-slate-900">Meetings</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              All Calendly bookings synced from your account
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => active.refetch()}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              title="Refresh"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${active.isFetching ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={meetings.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Export to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <a
              href="https://calendly.com/app/scheduled_events/user/me"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Calendly
            </a>
          </div>
        </div>

        {/* Tabs + date range + live count */}
        <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40">
          <div className="flex flex-wrap items-center gap-3">
            {/* Tabs — disabled visual when a date range is active */}
            <div
              className={`inline-flex rounded-lg bg-white border border-slate-200 p-0.5 ${
                rangeActive ? 'opacity-50' : ''
              }`}
              aria-disabled={rangeActive}
              title={rangeActive ? 'Clear the date range to use tabs' : undefined}
            >
              <TabButton
                active={!rangeActive && tab === 'upcoming'}
                disabled={rangeActive}
                onClick={() => setTab('upcoming')}
                count={upcoming.data?.total ?? 0}
                label="Upcoming"
              />
              <TabButton
                active={!rangeActive && tab === 'past'}
                disabled={rangeActive}
                onClick={() => setTab('past')}
                count={past.data?.total ?? 0}
                label="Past"
              />
            </div>

            {/* Date range picker — drives Calendly's server-side filter */}
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>

          <p className="text-[11px] text-slate-500 tabular-nums">
            {active.isLoading
              ? 'Loading…'
              : `Showing ${meetings.length}${
                  total > meetings.length ? ` of ${total}` : ''
                } ${meetings.length === 1 ? 'meeting' : 'meetings'}`}
          </p>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Loading */}
          {active.isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))}
            </div>
          )}

          {/* Calendly not configured */}
          {!active.isLoading && notConfigured && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-6 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 mb-2">
                <CalendarDays className="w-5 h-5 text-amber-700" />
              </div>
              <p className="text-sm font-semibold text-amber-900">
                Calendly is not connected yet
              </p>
              <p
                className="text-[12px] text-amber-800/90 mt-1 mx-auto leading-relaxed"
                style={{ maxWidth: '28rem' }}
              >
                Set{' '}
                <span className="font-mono bg-amber-100 border border-amber-200 rounded px-1 py-0.5">
                  CALENDLY_API_TOKEN
                </span>{' '}
                in your server environment (Personal Access Token from
                Calendly → Integrations → API &amp; Webhooks). Bookings will
                appear here as soon as the token is set; the page refreshes
                every 30 seconds while open.
              </p>
            </div>
          )}

          {/* Error */}
          {!active.isLoading && !notConfigured && active.isError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-6 text-center">
              <AlertCircle className="w-5 h-5 text-rose-600 mx-auto mb-1.5" />
              <p className="text-sm font-semibold text-rose-800">
                Couldn&apos;t load meetings
              </p>
              <button
                type="button"
                onClick={() => active.refetch()}
                className="mt-2 text-xs font-medium text-rose-700 hover:text-rose-900 underline cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty (table exists but no rows) */}
          {!active.isLoading &&
            !notConfigured &&
            !active.isError &&
            meetings.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-5 py-8 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 mb-2">
                  <Inbox className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {tab === 'upcoming' ? 'No upcoming meetings' : 'No past meetings'}
                </p>
                <p
                  className="text-[12px] text-slate-500 mt-1 mx-auto leading-relaxed"
                  style={{ maxWidth: '24rem' }}
                >
                  {tab === 'upcoming'
                    ? 'Bookings will appear here as soon as a lead schedules a call.'
                    : 'Completed and canceled meetings will show up here once they happen.'}
                </p>
              </div>
            )}

          {/* Grouped list */}
          {!active.isLoading && !notConfigured && groups.length > 0 && (
            <div className="space-y-1">
              {groups.map((group) => {
                const groupDate = new Date(group.dateKey);
                const isToday = isSameDay(groupDate, today);
                return (
                  <section key={group.dateKey}>
                    <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100">
                      <p className="text-[12px] font-semibold text-slate-700">
                        {formatDayHeader(group.dateKey)}
                      </p>
                      {isToday && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 text-violet-800 border border-violet-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          Today
                        </span>
                      )}
                      <span className="ml-auto text-[10px] text-slate-400 tabular-nums">
                        {group.items.length}{' '}
                        {group.items.length === 1 ? 'meeting' : 'meetings'}
                      </span>
                    </div>
                    <ul className="divide-y divide-slate-100">
                      {group.items.map((m) => (
                        <MeetingRow
                          key={m.id}
                          meeting={m}
                          onOpenDetails={setViewing}
                        />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <MeetingDetailsModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        meeting={viewing}
      />
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────── */

interface TabButtonProps {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  count: number;
  label: string;
}

function TabButton({ active, disabled, onClick, count, label }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${
        active
          ? 'bg-violet-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-50'
      } ${disabled ? 'hover:bg-transparent' : ''}`}
    >
      {label}
      <span
        className={`tabular-nums rounded-full px-1.5 py-0 text-[10px] ${
          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
        }`}
      >
        {count}
      </span>
    </button>
  );
}
