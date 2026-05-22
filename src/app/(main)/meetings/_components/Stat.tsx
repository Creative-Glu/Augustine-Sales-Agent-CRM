import type { ReactNode } from 'react';
import { STAT_TINT_CLASSES, type StatTint } from '@/constants/meetings';

interface StatProps {
  icon: ReactNode;
  label: string;
  value: string;
  tint: StatTint;
}

export function Stat({ icon, label, value, tint }: StatProps) {
  const t = STAT_TINT_CLASSES[tint];
  return (
    <div className="px-4 py-3 flex items-start gap-3">
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${t.bg} ${t.text} shrink-0`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}
