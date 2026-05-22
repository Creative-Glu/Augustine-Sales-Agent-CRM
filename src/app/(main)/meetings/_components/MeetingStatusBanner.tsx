import { AlertCircle } from 'lucide-react';
import type { MeetingStatus } from '@/types/meeting';

interface MeetingStatusBannerProps {
  status: MeetingStatus;
}

const BANNER_COPY: Partial<Record<MeetingStatus, { container: string; text: string; copy: string }>> = {
  canceled: {
    container: 'border-rose-200 bg-rose-50',
    text: 'text-rose-800',
    copy: 'This meeting was canceled.',
  },
  rescheduled: {
    container: 'border-amber-200 bg-amber-50',
    text: 'text-amber-800',
    copy: 'This meeting was rescheduled — check the source for the new time.',
  },
  completed: {
    container: 'border-slate-200 bg-slate-50',
    text: 'text-slate-800',
    copy: 'This meeting has ended.',
  },
};

export function MeetingStatusBanner({ status }: MeetingStatusBannerProps) {
  const config = BANNER_COPY[status];
  if (!config) return null;

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${config.container}`}>
      <AlertCircle className={`w-4 h-4 shrink-0 ${config.text.replace('800', '600')}`} />
      <p className={`text-xs font-medium ${config.text}`}>{config.copy}</p>
    </div>
  );
}
