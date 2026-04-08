import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/augustineApiClient';
import type { Campaign, CampaignStats } from '@/types/augustine';

export interface CreateCampaignInput {
  icp_id: number | string | null;
  name: string;
  template_subject: string;
  template_body: string;
  tone?: string | null;
  status?: Campaign['status'];
  daily_send_limit?: number | null;
  auto_mode?: boolean | null;
}

export async function listCampaigns(): Promise<Campaign[]> {
  try {
    const raw = await apiGet<Campaign[] | { items: Campaign[] }>('/api/campaigns');
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray((raw as any).items)) return (raw as any).items as Campaign[];
    return [];
  } catch (error) {
    throw error instanceof Error ? error : new Error('listCampaigns failed');
  }
}

export async function createCampaign(payload: CreateCampaignInput): Promise<Campaign> {
  try {
    return apiPost<Campaign, CreateCampaignInput>('/api/campaigns', payload);
  } catch (error) {
    throw error instanceof Error ? error : new Error('createCampaign failed');
  }
}

export async function getCampaign(id: number | string): Promise<Campaign> {
  try {
    return apiGet<Campaign>(`/api/campaigns/${id}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('getCampaign failed');
  }
}

export async function updateCampaign(
  id: number | string,
  updates: Partial<CreateCampaignInput>
): Promise<Campaign> {
  try {
    return apiPut<Campaign, Partial<CreateCampaignInput>>(`/api/campaigns/${id}`, updates);
  } catch (error) {
    throw error instanceof Error ? error : new Error('updateCampaign failed');
  }
}

export async function deleteCampaign(id: number | string): Promise<void> {
  try {
    await apiDelete<unknown>(`/api/campaigns/${id}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('deleteCampaign failed');
  }
}

export async function getCampaignStatsById(id: number | string): Promise<CampaignStats> {
  try {
    return apiGet<CampaignStats>(`/api/campaigns/${id}/stats`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('getCampaignStatsById failed');
  }
}
