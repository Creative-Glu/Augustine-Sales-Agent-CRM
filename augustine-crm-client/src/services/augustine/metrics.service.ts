import { apiGet } from '@/lib/augustineApiClient';
import type {
  MetricsOverview,
  MetricsSystem,
  MetricsRoi,
  Campaign,
  CampaignStats,
} from '@/types/augustine';

export async function getMetricsOverview(): Promise<MetricsOverview> {
  return apiGet<MetricsOverview>('/api/metrics/overview');
}

export async function getMetricsSystem(): Promise<MetricsSystem> {
  return apiGet<MetricsSystem>('/api/metrics/system');
}

export async function getMetricsRoi(): Promise<MetricsRoi> {
  return apiGet<MetricsRoi>('/api/metrics/roi');
}

export async function getCampaigns(): Promise<Campaign[]> {
  return apiGet<Campaign[]>('/api/campaigns');
}

export async function getCampaignStats(id: number | string): Promise<CampaignStats> {
  return apiGet<CampaignStats>(`/api/campaigns/${id}/stats`);
}

