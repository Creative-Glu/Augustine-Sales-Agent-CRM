import { Calendar, Clock } from 'lucide-react';
import { formatDateTimeShort } from '@/utils/format';
import { durationMinutes } from '@/utils/meetings';
import type { Meeting } from '@/types/meeting';
import { Stat } from './Stat';

interface MeetingSummaryCardProps {
  meeting: Meeting;
}

export function MeetingSummaryCard({ meeting }: MeetingSummaryCardProps) {
  const duration = durationMinutes(meeting);

  return (
    <section className="rounded-xl border border-slate-200 bg-card overflow-hidden shadow-sm">
      <div className="bg-linear-to-br from-violet-50 via-indigo-50/60 to-blue-50/40 px-5 py-4 border-b border-slate-200 relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />
        <div className="pl-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Invitee
          </p>
          <h3 className="mt-0.5 text-base font-bold text-slate-900 truncate">
            {meeting.invitee_name || meeting.invitee_email || 'Unknown invitee'}
          </h3>
          {meeting.event_type && (
            <p className="mt-1 text-xs text-slate-600">
              Event type:{' '}
              <span className="font-semibold text-slate-900">{meeting.event_type}</span>
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
  );
}
