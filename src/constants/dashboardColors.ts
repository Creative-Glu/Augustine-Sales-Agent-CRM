import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from '@heroicons/react/24/outline';

export const CHART_COLORS = {
  primary: '#3b82f6', // blue
  second: '#06b6d4', // cyan
  success: '#10b981', // green

  hover: {
    primary: '#2563eb',
    second: '#0891b2',
    success: '#059669',
  },
};

export const STAGE_COLORS: Record<string, string> = {
  Unknown: 'slate',
  Waiting: 'amber',
  Outreached: 'blue',
  Engaged: 'cyan',
  MQL: 'green',
  SAL: 'purple',
  SQL: 'indigo',
  'Closed-Won': 'emerald',
  'Closed-Lost': 'red',
  Paused: 'yellow',
  Disqualified: 'rose',
};

export const STAGE_ICONS: Record<string, any> = {
  Unknown: MinusIcon,
  Waiting: MinusIcon,
  Outreached: ArrowDownRightIcon,
  Engaged: ArrowUpRightIcon,
  MQL: ArrowUpRightIcon,
  SAL: ArrowUpRightIcon,
  SQL: ArrowUpRightIcon,
  'Closed-Won': ArrowUpRightIcon,
  'Closed-Lost': ArrowDownRightIcon,
  Paused: MinusIcon,
  Disqualified: ArrowDownRightIcon,
};
