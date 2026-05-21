'use client';

import { ChevronRight, Video, X, Calendar as CalendarIcon } from 'lucide-react';
import type { Meeting } from '@/types/meeting';

interface MeetingRowProps {
  meeting: Meeting;
  onOpenDetails: (meeting: Meeting) => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase();
}

/** Generate a deterministic accent color from the invitee email/name so each
 *  invitee gets a consistent colored dot (similar to Calendly). Falls back to
 *  violet if nothing to hash on. */
function dotColor(meeting: Meeting): string {
  const seed = (meeting.invitee_email || meeting.invitee_name || meeting.id) ?? '';
  const palette = [
    '#8b5cf6', // violet (Calendly's default)
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#6366f1', // indigo
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

export default function MeetingRow({ meeting, onOpenDetails }: MeetingRowProps) {
  const start = formatTime(meeting.start_at);
  const end = formatTime(meeting.end_at);
  const color = dotColor(meeting);
  const isCanceled = meeting.status === 'canceled';
  const isRescheduled = meeting.status === 'rescheduled';
  const isCompleted = meeting.status === 'completed';
  const hasJoinLink = !!meeting.meeting_url && !isCanceled && !isCompleted;

  const handleRowActivate = () => onOpenDetails(meeting);

  return (
    <li
      role="button"
      tabIndex={0}
      onClick={handleRowActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowActivate();
        }
      }}
      className="group cursor-pointer hover:bg-slate-50/80 focus:bg-slate-50/80 focus:outline-none transition-colors"
    >
      <div className="grid grid-cols-1 md:grid-cols-[minmax(140px,180px)_minmax(0,1fr)_auto_auto_auto] gap-3 md:gap-4 items-center px-5 py-3">
        {/* Time + colored dot */}
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`w-3 h-3 rounded-full shrink-0 ${isCanceled ? 'opacity-40' : ''}`}
            style={{ backgroundColor: color }}
            aria-hidden
          />
          <span
            className={`text-sm tabular-nums whitespace-nowrap ${
              isCanceled ? 'text-slate-400 line-through' : 'text-slate-700'
            }`}
          >
            {start} – {end}
          </span>
        </div>

        {/* Invitee + event type */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`text-sm font-semibold truncate max-w-65 ${
                isCanceled ? 'text-slate-500' : 'text-slate-900'
              }`}
              title={meeting.invitee_name ?? ''}
            >
              {meeting.invitee_name || meeting.invitee_email || 'Unknown invitee'}
            </p>
            {isCanceled && (
              <StatusPill tone="rose" icon={<X className="w-2.5 h-2.5" />}>
                Canceled
              </StatusPill>
            )}
            {isRescheduled && (
              <StatusPill tone="amber" icon={<CalendarIcon className="w-2.5 h-2.5" />}>
                Rescheduled
              </StatusPill>
            )}
            {isCompleted && (
              <StatusPill tone="slate" icon={<CalendarIcon className="w-2.5 h-2.5" />}>
                Completed
              </StatusPill>
            )}
          </div>
          {meeting.event_type && (
            <p className="text-[12px] text-slate-500 mt-0.5 truncate max-w-80">
              Event type{' '}
              <span className="font-medium text-slate-700">{meeting.event_type}</span>
            </p>
          )}
        </div>

        {/* Hosts count — desktop only */}
        <div className="text-[11px] text-slate-500 tabular-nums whitespace-nowrap text-right hidden md:block">
          {meeting.host_count} host{meeting.host_count === 1 ? '' : 's'}
          {' | '}
          {meeting.non_host_count} non-host{meeting.non_host_count === 1 ? '' : 's'}
        </div>

        {/* Join button — direct link, doesn't open details modal */}
        <div className="justify-self-start md:justify-self-end">
          {hasJoinLink ? (
            <a
              href={meeting.meeting_url ?? '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 cursor-pointer transition-colors whitespace-nowrap"
              title="Open the meeting link in a new tab"
            >
              <Video className="w-3 h-3" />
              Join
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-200 px-2.5 py-1 text-[11px] text-slate-400 whitespace-nowrap"
              title={
                isCanceled
                  ? 'Meeting was canceled'
                  : isCompleted
                    ? 'Meeting has ended'
                    : 'No join link provided'
              }
            >
              <Video className="w-3 h-3" />
              No link
            </span>
          )}
        </div>

        {/* Details affordance — visual only; row click handles the action */}
        <div className="flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-blue-600 transition-colors shrink-0 justify-self-end">
          Details
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </li>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────── */

interface StatusPillProps {
  tone: 'rose' | 'amber' | 'slate';
  icon: React.ReactNode;
  children: React.ReactNode;
}

function StatusPill({ tone, icon, children }: StatusPillProps) {
  const map = {
    rose: 'bg-rose-100 text-rose-800 border-rose-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${map[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
