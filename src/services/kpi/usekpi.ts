'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchKPIData,
  getConversionRate,
  getCTAClicked,
  getFunnelStageAnalytics,
} from './kpi.service';

// Conversion Rate
export const useConversionRate = (campaign_id?: number) =>
  useQuery({
    queryKey: ['conversionRate', campaign_id],
    queryFn: () => getConversionRate(campaign_id),
    staleTime: 1000 * 60, // optional: cache 1 min
  });

// CTA Clicked
export const useCTAClicked = (campaign_id?: number, sal_campaign_id?: number) =>
  useQuery({
    queryKey: ['ctaClicked', campaign_id, sal_campaign_id],
    queryFn: () => getCTAClicked(campaign_id, sal_campaign_id),
    staleTime: 1000 * 60,
  });

// Funnel Stage Analytics
export const useFunnelStageAnalytics = (campaign_id?: number, start_ts?: string, end_ts?: string) =>
  useQuery({
    queryKey: ['funnelStageAnalytics', campaign_id, start_ts, end_ts],
    queryFn: () => getFunnelStageAnalytics(campaign_id, start_ts, end_ts),
    staleTime: 1000 * 60,
  });

export const useKPIDashboard = () => {
  return useQuery({
    queryKey: ['kpiDashboard'],
    queryFn: fetchKPIData,
  });
};
