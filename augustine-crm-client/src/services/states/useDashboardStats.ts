'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from './dashboard.service';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000,
  });
}
