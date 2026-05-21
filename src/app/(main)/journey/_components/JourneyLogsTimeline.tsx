'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Clock,
  Inbox,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { STAGE_COLORS } from '@/constants/journey';
import { useJourneyLogs } from '@/services/logs/useJourneyLogs';

interface JourneyLogsTimelineProps {
  journeyId: string | null;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const NOTE_PREVIEW_CHARS = 220;

export default function JourneyLogsTimeline({ journeyId }: JourneyLogsTimelineProps) {
  const { data, isLoading, isError, isLive, refetch } = useJourneyLogs(journeyId);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  // Service returns DESC (newest first). We want ASC for chronological flow:
  // oldest at top, newest at the bottom — like a chat / audit log.
  const orderedLogs = useMemo(() => {
    if (!data) return [];
    return [...data].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [data]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    setShowJumpToLatest(false);
  };

  // Auto-scroll to bottom on first load and whenever a new entry arrives.
  useEffect(() => {
    if (!orderedLogs.length) return;
    const el = scrollRef.current;
    if (!el) return;

    const prevCount = lastCountRef.current;
    const newCount = orderedLogs.length;

    if (prevCount === 0) {
      // First load — jump instantly without animation
      scrollToBottom('auto');
    } else if (newCount > prevCount) {
      // New entry — only auto-scroll if user is already near the bottom
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      if (nearBottom) {
        scrollToBottom('smooth');
      } else {
        setShowJumpToLatest(true);
      }
    }

    lastCountRef.current = newCount;
  }, [orderedLogs.length]);

  // Track scroll position to show/hide the "jump to latest" button
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom && showJumpToLatest) setShowJumpToLatest(false);
  };

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!journeyId) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-800">Activity Log</h3>
          <span className="text-[11px] text-slate-500">
            {data ? `${data.length} ${data.length === 1 ? 'entry' : 'entries'}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              isLive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-50 text-slate-500 border border-slate-200'
            }`}
            title={isLive ? 'Listening for live updates' : 'Realtime is not connected'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {isLive ? 'Live' : 'Offline'}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && isError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-center">
          <AlertCircle className="w-5 h-5 text-rose-600 mx-auto mb-1.5" />
          <p className="text-sm font-medium text-rose-800">Failed to load logs</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 text-xs font-medium text-rose-700 hover:text-rose-900 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
          <Inbox className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No logs yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Activity for this journey — emails sent, replies, status changes — will
            appear here in real time.
          </p>
        </div>
      )}

      {/* Timeline — scrollable, oldest at top, newest at bottom */}
      {!isLoading && !isError && orderedLogs.length > 0 && (
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="max-h-[420px] overflow-y-auto pr-1"
          >
            <ol className="relative space-y-3 pl-5 py-1">
              {/* Vertical connector line */}
              <div
                aria-hidden
                className="absolute left-1.5 top-2 bottom-2 w-px bg-linear-to-b from-slate-200 via-slate-200 to-slate-300"
              />

              {orderedLogs.map((log, i) => {
                const color = STAGE_COLORS[log.funnel_stage] || '#94a3b8';
                const isOpen = expanded[log.log_id] ?? false;
                const notes = log.notes ?? '';
                const isLong = notes.length > NOTE_PREVIEW_CHARS;
                const displayNotes =
                  isOpen || !isLong
                    ? notes
                    : `${notes.slice(0, NOTE_PREVIEW_CHARS).trimEnd()}…`;
                const isNewest = i === orderedLogs.length - 1;

                return (
                  <li key={log.log_id} className="relative">
                    {/* Stage-colored dot on the connector */}
                    <span
                      className={`absolute -left-4.5 top-3 w-3 h-3 rounded-full border-2 border-white shadow ${
                        isNewest ? 'ring-2 ring-emerald-300 ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />

                    <article
                      className={`rounded-lg border bg-white shadow-sm overflow-hidden transition-shadow ${
                        isNewest
                          ? 'border-emerald-300 shadow-emerald-100'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Header */}
                      <header className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50/60 border-b border-slate-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shrink-0"
                            style={{ backgroundColor: color }}
                          >
                            <span className="w-1 h-1 rounded-full bg-white/90" />
                            {log.funnel_stage}
                          </span>
                          <span
                            className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0"
                            title={`Log #${log.idx}`}
                          >
                            #{log.idx}
                          </span>
                          {isNewest && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
                              <Sparkles className="w-2.5 h-2.5" />
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 shrink-0">
                          <Clock className="w-3 h-3" />
                          <span
                            title={formatTimestamp(log.created_at)}
                            className="tabular-nums"
                          >
                            {relativeTime(log.created_at)}
                          </span>
                        </div>
                      </header>

                      {/* Notes */}
                      <div className="px-3 py-2.5">
                        {notes ? (
                          <>
                            <pre className="whitespace-pre-wrap wrap-break-word font-sans text-[12px] leading-relaxed text-slate-700">
                              {displayNotes}
                            </pre>
                            {isLong && (
                              <button
                                type="button"
                                onClick={() => toggle(log.log_id)}
                                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800"
                              >
                                {isOpen ? (
                                  <>
                                    <ChevronUp className="w-3 h-3" />
                                    Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3 h-3" />
                                    Show more ({notes.length.toLocaleString()} chars)
                                  </>
                                )}
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="text-[12px] text-slate-400 italic">No notes</p>
                        )}
                      </div>

                      {/* Footer with timestamp */}
                      <footer className="px-3 py-1.5 bg-slate-50/40 border-t border-slate-100 text-[10px] text-slate-400 tabular-nums">
                        {formatTimestamp(log.created_at)}
                      </footer>
                    </article>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Floating "jump to latest" pill — appears when user scrolled away */}
          {showJumpToLatest && (
            <button
              type="button"
              onClick={() => scrollToBottom('smooth')}
              className="absolute left-1/2 bottom-3 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-3 py-1.5 shadow-lg transition-colors animate-in fade-in slide-in-from-bottom-2"
            >
              <ArrowDown className="w-3 h-3" />
              New activity — jump to latest
            </button>
          )}
        </div>
      )}
    </div>
  );
}
