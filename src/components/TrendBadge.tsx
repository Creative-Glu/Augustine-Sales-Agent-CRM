'use client';

import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';

interface TrendBadgeProps {
  /** Value in the current period. */
  current: number;
  /** Value in the previous period. */
  previous: number;
  /** What "up" means semantically. Defaults to 'up-good' (green when up). */
  variant?: 'up-good' | 'up-bad';
  /** Label for the comparison period, e.g. "vs last 7d". Defaults to "vs prev". */
  periodLabel?: string;
}

/**
 * Tiny inline trend chip: arrow + percentage + period label.
 * Decides color from variant: 'up-good' is green when current > previous,
 * 'up-bad' (e.g. stale leads) is red when current > previous.
 */
export function TrendBadge({
  current,
  previous,
  variant = 'up-good',
  periodLabel = 'vs prev',
}: TrendBadgeProps) {
  // No baseline to compare against — render a neutral placeholder so layout
  // stays consistent across tiles.
  if (previous === 0 && current === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-400">
        <ArrowRight className="w-2.5 h-2.5" />
        no change · {periodLabel}
      </span>
    );
  }

  // From zero → positive growth, but percentage is undefined. Show "+N new".
  if (previous === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
        <ArrowUp className="w-2.5 h-2.5" />+{current} new · {periodLabel}
      </span>
    );
  }

  const deltaPct = ((current - previous) / previous) * 100;
  const rounded = Math.round(deltaPct);

  if (rounded === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500">
        <ArrowRight className="w-2.5 h-2.5" />
        0% · {periodLabel}
      </span>
    );
  }

  const isUp = rounded > 0;
  const isGood = variant === 'up-good' ? isUp : !isUp;
  const color = isGood ? 'text-emerald-600' : 'text-rose-600';
  const Icon = isUp ? ArrowUp : ArrowDown;
  const sign = isUp ? '+' : '';

  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${color}`}>
      <Icon className="w-2.5 h-2.5" />
      {sign}
      {rounded}% · {periodLabel}
    </span>
  );
}
