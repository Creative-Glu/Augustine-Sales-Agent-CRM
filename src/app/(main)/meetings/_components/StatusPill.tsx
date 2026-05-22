import type { ReactNode } from 'react';
import { STATUS_PILL_TONE_CLASSES, type StatusPillTone } from '@/constants/meetings';

interface StatusPillProps {
  tone: StatusPillTone;
  icon: ReactNode;
  children: ReactNode;
}

export function StatusPill({ tone, icon, children }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_PILL_TONE_CLASSES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
