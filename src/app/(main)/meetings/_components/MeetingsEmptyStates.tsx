import { AlertCircle, CalendarDays, Inbox } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { MeetingsTab } from './MeetingsToolbar';

export function MeetingsLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-md" />
      ))}
    </div>
  );
}

export function MeetingsNotConfigured() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-6 text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 mb-2">
        <CalendarDays className="w-5 h-5 text-amber-700" />
      </div>
      <p className="text-sm font-semibold text-amber-900">Calendly is not connected yet</p>
      <p
        className="text-[12px] text-amber-800/90 mt-1 mx-auto leading-relaxed"
        style={{ maxWidth: '28rem' }}
      >
        Set{' '}
        <span className="font-mono bg-amber-100 border border-amber-200 rounded px-1 py-0.5">
          CALENDLY_API_TOKEN
        </span>{' '}
        in your server environment (Personal Access Token from Calendly → Integrations → API
        &amp; Webhooks). Bookings will appear here as soon as the token is set; the page
        refreshes every 30 seconds while open.
      </p>
    </div>
  );
}

interface MeetingsErrorStateProps {
  onRetry: () => void;
}

export function MeetingsErrorState({ onRetry }: MeetingsErrorStateProps) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-6 text-center">
      <AlertCircle className="w-5 h-5 text-rose-600 mx-auto mb-1.5" />
      <p className="text-sm font-semibold text-rose-800">Couldn&apos;t load meetings</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 text-xs font-medium text-rose-700 hover:text-rose-900 underline cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}

interface MeetingsEmptyStateProps {
  tab: MeetingsTab;
}

export function MeetingsEmptyState({ tab }: MeetingsEmptyStateProps) {
  return (
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
  );
}
