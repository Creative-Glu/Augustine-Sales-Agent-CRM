'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDateTimeShort } from '@/utils/format';
import type { Meeting } from '@/types/meeting';
import {
  Calendar,
  Clock,
  Mail,
  User,
  Tag,
  Video,
  ExternalLink,
  Users,
  AlertCircle,
} from 'lucide-react';

interface MeetingDetailsModalProps {
  open: boolean;
  onClose: () => void;
  meeting: Meeting | null;
}

function durationMinutes(meeting: Meeting): number {
  const ms = new Date(meeting.end_at).getTime() - new Date(meeting.start_at).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

export default function MeetingDetailsModal({
  open,
  onClose,
  meeting,
}: MeetingDetailsModalProps) {
  if (!meeting) return null;

  const isCanceled = meeting.status === 'canceled';
  const isRescheduled = meeting.status === 'rescheduled';
  const isCompleted = meeting.status === 'completed';
  const duration = durationMinutes(meeting);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-170 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
              <Calendar className="w-4 h-4" />
            </span>
            Meeting Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* ─── Status banner if not scheduled ──────────────────── */}
          {isCanceled && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 dark:bg-rose-500/15 dark:border-rose-500/30">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 dark:text-rose-400" />
              <p className="text-xs font-medium text-rose-800 dark:text-rose-400">
                This meeting was canceled.
              </p>
            </div>
          )}
          {isRescheduled && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:bg-amber-500/15 dark:border-amber-500/30">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 dark:text-amber-400" />
              <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
                This meeting was rescheduled — check the source for the new time.
              </p>
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
              <AlertCircle className="w-4 h-4 text-slate-600 shrink-0 dark:text-slate-400" />
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                This meeting has ended.
              </p>
            </div>
          )}

          {/* ─── Header card ─────────────────────────────────────── */}
          <section className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="bg-linear-to-br from-violet-50 via-indigo-50/60 to-blue-50/40 dark:from-violet-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 px-5 py-4 border-b border-border relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />
              <div className="pl-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Invitee
                </p>
                <h3 className="mt-0.5 text-base font-bold text-slate-900 truncate dark:text-slate-100">
                  {meeting.invitee_name || meeting.invitee_email || 'Unknown invitee'}
                </h3>
                {meeting.event_type && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Event type:{' '}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {meeting.event_type}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <Stat
                icon={<Clock className="w-4 h-4" />}
                label="Start"
                value={formatDateTimeShort(meeting.start_at)}
                tint="emerald"
              />
              <Stat
                icon={<Clock className="w-4 h-4" />}
                label="End"
                value={formatDateTimeShort(meeting.end_at)}
                tint="amber"
              />
              <Stat
                icon={<Calendar className="w-4 h-4" />}
                label="Duration"
                value={`${duration} min`}
                tint="indigo"
              />
            </div>
          </section>

          {/* ─── Invitee details ─────────────────────────────────── */}
          <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/60 dark:to-blue-950/40 border-b border-border">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                <User className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Invitee</p>
            </div>
            <div className="p-4 space-y-2 text-sm">
              {meeting.invitee_name && (
                <Row icon={<User className="w-3.5 h-3.5" />} label="Name">
                  {meeting.invitee_name}
                </Row>
              )}
              {meeting.invitee_email && (
                <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email">
                  <a
                    href={`mailto:${meeting.invitee_email}`}
                    className="text-blue-600 hover:text-blue-800 underline-offset-2 hover:underline truncate inline-block max-w-80 dark:text-blue-400"
                  >
                    {meeting.invitee_email}
                  </a>
                </Row>
              )}
              {!meeting.invitee_name && !meeting.invitee_email && (
                <p className="text-[12px] text-slate-400 italic dark:text-slate-500">
                  No invitee information.
                </p>
              )}
            </div>
          </section>

          {/* ─── Meeting + Hosts ─────────────────────────────────── */}
          <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-50 to-blue-50/30 dark:from-emerald-950/40 dark:to-blue-950/40 border-b border-border">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                <Users className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Meeting</p>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <Row icon={<Users className="w-3.5 h-3.5" />} label="Hosts">
                {meeting.host_count} host{meeting.host_count === 1 ? '' : 's'} ·{' '}
                {meeting.non_host_count} non-host
                {meeting.non_host_count === 1 ? '' : 's'}
              </Row>
              <Row icon={<Tag className="w-3.5 h-3.5" />} label="Source">
                <Badge variant="secondary" className="text-[11px] capitalize">
                  {meeting.source}
                </Badge>
              </Row>
              <Row icon={<Tag className="w-3.5 h-3.5" />} label="External ID" mono>
                {meeting.external_id}
              </Row>
              {meeting.meeting_url && (
                <Row icon={<Video className="w-3.5 h-3.5" />} label="Join link">
                  <a
                    href={meeting.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline dark:text-emerald-400"
                  >
                    Open
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Row>
              )}
            </div>
          </section>

          {/* ─── Notes ───────────────────────────────────────────── */}
          {meeting.notes && (
            <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/60 dark:to-blue-950/40 border-b border-border">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-muted text-slate-600 dark:text-slate-400">
                  <Tag className="w-3.5 h-3.5" />
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Notes</p>
              </div>
              <div className="p-4">
                <div
                  className="rounded-lg border border-border bg-muted/50 p-3 overflow-y-auto"
                  style={{ maxHeight: '14rem' }}
                >
                  <pre className="whitespace-pre-wrap wrap-break-word font-sans text-[12px] leading-relaxed text-slate-700 dark:text-slate-200">
                    {meeting.notes}
                  </pre>
                </div>
              </div>
            </section>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-card border border-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────── */

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: 'emerald' | 'indigo' | 'amber';
}

function Stat({ icon, label, value, tint }: StatProps) {
  const map = {
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-300' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-300' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-300' },
  };
  const t = map[tint];
  return (
    <div className="px-4 py-3 flex items-start gap-3">
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${t.bg} ${t.text} shrink-0`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-900 truncate dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  mono,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-400 mt-1 shrink-0 dark:text-slate-500">{icon}</span>
      <span className="text-slate-500 w-24 shrink-0 text-[11px] mt-0.5 uppercase tracking-wider font-semibold dark:text-slate-400">
        {label}
      </span>
      <span
        className={`text-slate-800 dark:text-slate-200 min-w-0 ${mono ? 'font-mono text-[11px] break-all' : ''}`}
      >
        {children}
      </span>
    </div>
  );
}
