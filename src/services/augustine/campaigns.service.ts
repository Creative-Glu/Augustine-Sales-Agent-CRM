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
  const raw = await apiGet<Campaign[] | { items: Campaign[] }>('/api/campaigns');
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray((raw as any).items)) return (raw as any).items as Campaign[];
  return [];
}

export async function createCampaign(payload: CreateCampaignInput): Promise<Campaign> {
  return apiPost<Campaign, CreateCampaignInput>('/api/campaigns', payload);
}

export async function getCampaign(id: number | string): Promise<Campaign> {
  return apiGet<Campaign>(`/api/campaigns/${id}`);
}

export async function updateCampaign(
  id: number | string,
  updates: Partial<CreateCampaignInput>
): Promise<Campaign> {
  return apiPut<Campaign, Partial<CreateCampaignInput>>(`/api/campaigns/${id}`, updates);
}

export async function deleteCampaign(id: number | string): Promise<void> {
  await apiDelete<unknown>(`/api/campaigns/${id}`);
}

export async function getCampaignStatsById(id: number | string): Promise<CampaignStats> {
  return apiGet<CampaignStats>(`/api/campaigns/${id}/stats`);
}

