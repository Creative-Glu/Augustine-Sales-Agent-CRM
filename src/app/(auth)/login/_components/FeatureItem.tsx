import type { ReactNode } from 'react';

interface FeatureItemProps {
  icon: ReactNode;
  children: ReactNode;
}

export function FeatureItem({ icon, children }: FeatureItemProps) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{
          background: 'rgba(59,130,246,0.15)',
          color: '#93c5fd',
          boxShadow: 'inset 0 0 0 1px rgba(96,165,250,0.20)',
        }}
      >
        {icon}
      </span>
      <span className="leading-relaxed" style={{ color: 'rgba(226,232,240,0.90)' }}>
        {children}
      </span>
    </li>
  );
}
