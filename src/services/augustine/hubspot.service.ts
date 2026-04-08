import { apiGet, apiPost } from '@/lib/augustineApiClient';
import type { HubSpotHealth, SyncQueueResponse } from '@/types/execution';

export async function getHubspotHealth(): Promise<HubSpotHealth> {
  try {
    return apiGet<HubSpotHealth>('/api/hubspot-health');
  } catch (error) {
    throw error instanceof Error ? error : new Error('getHubspotHealth failed');
  }
}

export interface SyncQueueParams {
  status?: string;
  entity_type?: string;
  limit?: number;
  offset?: number;
}

export async function getSyncQueue(params: SyncQueueParams = {}): Promise<SyncQueueResponse> {
  try {
    const sp = new URLSearchParams();
    if (params.status) sp.set('status', params.status);
    if (params.entity_type) sp.set('entity_type', params.entity_type);
    if (params.limit != null) sp.set('limit', String(params.limit));
    if (params.offset != null) sp.set('offset', String(params.offset));
    const qs = sp.toString();
    const path = qs ? `/api/sync-queue?${qs}` : '/api/sync-queue';
    return apiGet<SyncQueueResponse>(path);
  } catch (error) {
    throw error instanceof Error ? error : new Error('getSyncQueue failed');
  }
}

export async function retrySyncQueueItem(queueId: string | number): Promise<void> {
  try {
    await apiPost<unknown, { type: 'queue'; id: string | number }>('/api/sync-retry', {
      type: 'queue',
      id: queueId,
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('retrySyncQueueItem failed');
  }
}
