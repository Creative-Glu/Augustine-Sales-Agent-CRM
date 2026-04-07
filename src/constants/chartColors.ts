export const CHART_COLORS = {
  leads: {
    start: '#3b82f6',
    end: '#93c5fd',
  },
  occurrences: {
    start: '#10b981',
    end: '#6ee7b7',
  },
  hours: {
    start: '#f59e0b',
    end: '#fcd34d',
  },
};

export const FOOTER_STATS = [
  { key: 'leadsReached', label: 'Total Leads', color: 'blue' },
  { key: 'stageOccurrences', label: 'Total Occurrences', color: 'green' },
  { key: 'avgHours', label: 'Avg Time', color: 'orange', suffix: 'h', isAverage: true },
];
