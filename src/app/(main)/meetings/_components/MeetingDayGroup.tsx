import dynamic from 'next/dynamic';
import type { Meeting } from '@/types/meeting';
import { formatDayHeader, isSameDay } from '@/utils/meetings';

const MeetingRow = dynamic(() => import('./MeetingRow'), { ssr: false });

interface MeetingDayGroupProps {
  dateKey: string;
  items: Meeting[];
  today: Date;
  onOpenDetails: (meeting: Meeting) => void;
}

export function MeetingDayGroup({
  dateKey,
  items,
  today,
  onOpenDetails,
}: MeetingDayGroupProps) {
  const groupDate = new Date(dateKey);
  const isToday = isSameDay(groupDate, today);

  return (
    <section>
      <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100">
        <p className="text-[12px] font-semibold text-slate-700">{formatDayHeader(dateKey)}</p>
        {isToday && (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 text-violet-800 border border-violet-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Today
          </span>
        )}
        <span className="ml-auto text-[10px] text-slate-400 tabular-nums">
          {items.length} {items.length === 1 ? 'meeting' : 'meetings'}
        </span>
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map((m) => (
          <MeetingRow key={m.id} meeting={m} onOpenDetails={onOpenDetails} />
        ))}
      </ul>
    </section>
  );
}
