'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardAnalytics } from './dashboard.service';

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: getDashboardAnalytics,
    staleTime: 5 * 60 * 1000,
  });
}
