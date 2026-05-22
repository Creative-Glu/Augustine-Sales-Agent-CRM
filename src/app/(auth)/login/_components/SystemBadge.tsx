import type { ReactNode } from 'react';

interface SystemBadgeProps {
  label: string;
  value: ReactNode;
}

export function SystemBadge({ label, value }: SystemBadgeProps) {
  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{
        background: 'rgba(15,23,42,0.40)',
        borderColor: 'rgba(51,65,85,0.60)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <p
        className="text-[10px] font-medium uppercase tracking-wide truncate"
        style={{ color: '#94a3b8' }}
      >
        {label}
      </p>
      <div className="mt-0.5 text-xs font-semibold text-slate-100">{value}</div>
    </div>
  );
}
