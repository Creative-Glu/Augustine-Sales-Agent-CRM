import { Suspense } from 'react';
import MeetingsPage from './_components';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading…</div>}>
      <MeetingsPage />
    </Suspense>
  );
}
