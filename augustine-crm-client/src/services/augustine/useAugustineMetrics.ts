'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getMetricsOverview,
  getMetricsSystem,
  getMetricsRoi,
  getCampaigns,
} from './metrics.service';

export function useAugustineMetrics() {
  const overviewQuery = useQuery({
    queryKey: ['augustine', 'metrics', 'overview'],
    queryFn: getMetricsOverview,
    staleTime: 30_000,
  });

  const systemQuery = useQuery({
    queryKey: ['augustine', 'metrics', 'system'],
    queryFn: getMetricsSystem,
    staleTime: 30_000,
  });

  const roiQuery = useQuery({
    queryKey: ['augustine', 'metrics', 'roi'],
    queryFn: getMetricsRoi,
    staleTime: 60_000,
  });

  const campaignsQuery = useQuery({
    queryKey: ['augustine', 'metrics', 'campaigns'],
    queryFn: getCampaigns,
    staleTime: 60_000,
  });

  const campaignsDataRaw = campaignsQuery.data;
  const campaignsArray = Array.isArray(campaignsDataRaw)
    ? campaignsDataRaw
    : Array.isArray((campaignsDataRaw as any)?.items)
      ? (campaignsDataRaw as any).items
      : [];

  return {
    overview: overviewQuery.data,
    system: systemQuery.data,
    roi: roiQuery.data,
    campaigns: campaignsArray,
    isLoading: overviewQuery.isLoading || systemQuery.isLoading || roiQuery.isLoading,
    isError: overviewQuery.isError || systemQuery.isError || roiQuery.isError,
  };
}

