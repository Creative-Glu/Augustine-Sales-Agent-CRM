// Full stage order
export const STAGE_ORDER = [
  'Unknown',
  'Waiting',
  'Outreached',
  'Engaged',
  'MQL',
  'SAL',
  'SQL',
  'Closed-Won',
  'Closed-Lost',
  'Paused',
  'Disqualified',
];

// Colors for stages
export const STAGE_COLORS: Record<string, string> = {
  Unknown: '#B0B0B0',
  Waiting: '#FFBB28',
  Outreached: '#8884d8',
  Engaged: '#82ca9d',
  MQL: '#FF8042',
  SAL: '#00C49F',
  SQL: '#0088FE',
  'Closed-Won': '#00BFFF',
  'Closed-Lost': '#FF6666',
  Paused: '#D0D0D0',
  Disqualified: '#A9A9A9',
};
