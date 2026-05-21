import { Suspense } from 'react';
import MeetingsPage from './_components';
import { Header } from '@/components/Header';
import { CalendarDays } from 'lucide-react';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading…</div>}>
      <Header
        title="Meeting Management"
        subtitle="Manage scheduled meetings, track appointments, and monitor team calendars seamlessly."
        icon={<CalendarDays className="w-6 h-6 text-white" />}
        showLive
      />

      <MeetingsPage />
    </Suspense>
  );
}
