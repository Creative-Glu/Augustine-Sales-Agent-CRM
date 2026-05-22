import DateRangePicker from './DateRangePicker';
import { TabButton } from './TabButton';
import type { DateRange } from '@/utils/dateRange';

export type MeetingsTab = 'upcoming' | 'past';

interface MeetingsToolbarProps {
  tab: MeetingsTab;
  rangeActive: boolean;
  upcomingCount: number;
  pastCount: number;
  shownCount: number;
  totalCount: number;
  isLoading: boolean;
  dateRange: DateRange;
  onTabChange: (tab: MeetingsTab) => void;
  onDateRangeChange: (range: DateRange) => void;
}

export function MeetingsToolbar({
  tab,
  rangeActive,
  upcomingCount,
  pastCount,
  shownCount,
  totalCount,
  isLoading,
  dateRange,
  onTabChange,
  onDateRangeChange,
}: MeetingsToolbarProps) {
  return (
    <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40">
      <div className="flex flex-wrap items-center gap-3">
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
            onClick={() => onTabChange('upcoming')}
            count={upcomingCount}
            label="Upcoming"
          />
          <TabButton
            active={!rangeActive && tab === 'past'}
            disabled={rangeActive}
            onClick={() => onTabChange('past')}
            count={pastCount}
            label="Past"
          />
        </div>

        <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
      </div>

      <p className="text-[11px] text-slate-500 tabular-nums">
        {isLoading
          ? 'Loading…'
          : `Showing ${shownCount}${
              totalCount > shownCount ? ` of ${totalCount}` : ''
            } ${shownCount === 1 ? 'meeting' : 'meetings'}`}
      </p>
    </div>
  );
}
