import { apiGet, apiPost } from '@/lib/augustineApiClient';
import type { HubSpotHealth, SyncQueueResponse } from '@/types/execution';

export async function getHubspotHealth(): Promise<HubSpotHealth> {
  return apiGet<HubSpotHealth>('/api/hubspot-health');
}

export interface SyncQueueParams {
  status?: string;
  entity_type?: string;
  limit?: number;
}

export async function getSyncQueue(params: SyncQueueParams = {}): Promise<SyncQueueResponse> {
  const sp = new URLSearchParams();
  if (params.status) sp.set('status', params.status);
  if (params.entity_type) sp.set('entity_type', params.entity_type);
  if (params.limit != null) sp.set('limit', String(params.limit));
  const qs = sp.toString();
  const path = qs ? `/api/sync-queue?${qs}` : '/api/sync-queue';
  return apiGet<SyncQueueResponse>(path);
}

export async function retrySyncQueueItem(queueId: string | number): Promise<void> {
  await apiPost<unknown, { type: 'queue'; id: string | number }>('/api/sync-retry', {
    type: 'queue',
    id: queueId,
  });
}

