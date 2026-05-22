import type { ReactNode } from 'react';

interface DetailRowProps {
  icon: ReactNode;
  label: string;
  mono?: boolean;
  children: ReactNode;
}

export function DetailRow({ icon, label, mono, children }: DetailRowProps) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-400 mt-1 shrink-0">{icon}</span>
      <span className="text-slate-500 w-24 shrink-0 text-[11px] mt-0.5 uppercase tracking-wider font-semibold">
        {label}
      </span>
      <span
        className={`text-slate-800 min-w-0 ${mono ? 'font-mono text-[11px] break-all' : ''}`}
      >
        {children}
      </span>
    </div>
  );
}
