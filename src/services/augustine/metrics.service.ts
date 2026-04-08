import { apiGet } from '@/lib/augustineApiClient';
import type {
  MetricsOverview,
  MetricsSystem,
  MetricsRoi,
  Campaign,
  CampaignStats,
} from '@/types/augustine';

export async function getMetricsOverview(): Promise<MetricsOverview> {
  try {
    return apiGet<MetricsOverview>('/api/metrics/overview');
  } catch (error) {
    throw error instanceof Error ? error : new Error('getMetricsOverview failed');
  }
}

export async function getMetricsSystem(): Promise<MetricsSystem> {
  try {
    return apiGet<MetricsSystem>('/api/metrics/system');
  } catch (error) {
    throw error instanceof Error ? error : new Error('getMetricsSystem failed');
  }
}

export async function getMetricsRoi(): Promise<MetricsRoi> {
  try {
    return apiGet<MetricsRoi>('/api/metrics/roi');
  } catch (error) {
    throw error instanceof Error ? error : new Error('getMetricsRoi failed');
  }
}

export async function getCampaigns(): Promise<Campaign[]> {
  try {
    return apiGet<Campaign[]>('/api/campaigns');
  } catch (error) {
    throw error instanceof Error ? error : new Error('getCampaigns failed');
  }
}

export async function getCampaignStats(id: number | string): Promise<CampaignStats> {
  try {
    return apiGet<CampaignStats>(`/api/campaigns/${id}/stats`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('getCampaignStats failed');
  }
}
