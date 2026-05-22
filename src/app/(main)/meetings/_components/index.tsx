'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  MEETINGS_DEFAULT_LIMIT,
  MEETINGS_RANGE_LIMIT,
} from '@/constants/meetings';
import {
  useMeetingsInRange,
  usePastMeetings,
  useUpcomingMeetings,
} from '@/services/meetings/useMeetings';
import type { Meeting } from '@/types/meeting';
import {
  EMPTY_DATE_RANGE,
  isRangeActive,
  type DateRange,
} from '@/utils/dateRange';
import { downloadMeetingsCsv, groupMeetingsByDay } from '@/utils/meetings';
import { MeetingDayGroup } from './MeetingDayGroup';
import {
  MeetingsEmptyState,
  MeetingsErrorState,
  MeetingsLoadingSkeleton,
  MeetingsNotConfigured,
} from './MeetingsEmptyStates';
import { MeetingsHeader } from './MeetingsHeader';
import { MeetingsHints } from './MeetingsHints';
import { MeetingsToolbar, type MeetingsTab } from './MeetingsToolbar';

const MeetingDetailsModal = dynamic(() => import('./MeetingDetailsModal'), { ssr: false });

export default function MeetingsPage() {
  const [tab, setTab] = useState<MeetingsTab>('upcoming');
  const [viewing, setViewing] = useState<Meeting | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(EMPTY_DATE_RANGE);

  // When a range is set, all filtering happens on Calendly's side via
  // min_start_time / max_start_time — the tabs become inert in this mode.
  const rangeActive = isRangeActive(dateRange);

  const upcoming = useUpcomingMeetings(MEETINGS_DEFAULT_LIMIT);
  const past = usePastMeetings(MEETINGS_DEFAULT_LIMIT);
  const ranged = useMeetingsInRange({
    startIso: dateRange.startIso,
    endIso: dateRange.endIso,
    limit: MEETINGS_RANGE_LIMIT,
    enabled: rangeActive,
  });

  const active = rangeActive ? ranged : tab === 'upcoming' ? upcoming : past;
  const meetings = active.data?.meetings ?? [];
  const total = active.data?.total ?? 0;
  const notConfigured = active.data?.notConfigured ?? false;

  const groups = useMemo(() => groupMeetingsByDay(meetings), [meetings]);
  const today = useMemo(() => new Date(), []);

  const handleExport = () =>
    downloadMeetingsCsv(meetings, rangeActive ? 'range' : tab);

  return (
    <div className="space-y-5">
      <MeetingsHints />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <MeetingsHeader
          isFetching={active.isFetching}
          canExport={meetings.length > 0}
          onRefresh={() => active.refetch()}
          onExport={handleExport}
        />

        <MeetingsToolbar
          tab={tab}
          rangeActive={rangeActive}
          upcomingCount={upcoming.data?.total ?? 0}
          pastCount={past.data?.total ?? 0}
          shownCount={meetings.length}
          totalCount={total}
          isLoading={active.isLoading}
          dateRange={dateRange}
          onTabChange={setTab}
          onDateRangeChange={setDateRange}
        />

        <div className="p-4">
          {active.isLoading && <MeetingsLoadingSkeleton />}

          {!active.isLoading && notConfigured && <MeetingsNotConfigured />}

          {!active.isLoading && !notConfigured && active.isError && (
            <MeetingsErrorState onRetry={() => active.refetch()} />
          )}

          {!active.isLoading &&
            !notConfigured &&
            !active.isError &&
            meetings.length === 0 && <MeetingsEmptyState tab={tab} />}

          {!active.isLoading && !notConfigured && groups.length > 0 && (
            <div className="space-y-1">
              {groups.map((group) => (
                <MeetingDayGroup
                  key={group.dateKey}
                  dateKey={group.dateKey}
                  items={group.items}
                  today={today}
                  onOpenDetails={setViewing}
                />
              ))}
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
