import { apiGet, apiPost } from '@/lib/augustineApiClient';

export interface HubspotSyncConfig {
  enabled: boolean;
}

// Extended health returned from GET /api/hubspot-health when sync config is enabled.
export interface HubspotExtendedHealth {
  enabled: boolean;
  worker_running: boolean;
  sync_enabled: boolean;
}

export type HubspotEntityType = 'staff' | 'institution';

export async function getHubspotSyncConfig(): Promise<HubspotSyncConfig> {
  try {
    return apiGet<HubspotSyncConfig>('/api/hubspot-sync/config');
  } catch (error) {
    throw error instanceof Error ? error : new Error('getHubspotSyncConfig failed');
  }
}

export async function updateHubspotSyncConfig(
  enabled: boolean
): Promise<HubspotSyncConfig> {
  try {
    return apiPost<HubspotSyncConfig, { enabled: boolean }>(
      '/api/hubspot-sync/config',
      { enabled }
    );
  } catch (error) {
    throw error instanceof Error ? error : new Error('updateHubspotSyncConfig failed');
  }
}

export async function getHubspotExtendedHealth(): Promise<HubspotExtendedHealth> {
  try {
    return apiGet<HubspotExtendedHealth>('/api/hubspot-health');
  } catch (error) {
    throw error instanceof Error ? error : new Error('getHubspotExtendedHealth failed');
  }
}

export async function runHubspotSingleSync(
  entity_type: HubspotEntityType,
  entity_id: number
): Promise<HubspotSyncConfig> {
  try {
    return apiPost<HubspotSyncConfig, { entity_type: HubspotEntityType; entity_id: number }>(
      '/api/hubspot-sync/run',
      { entity_type, entity_id }
    );
  } catch (error) {
    throw error instanceof Error ? error : new Error('runHubspotSingleSync failed');
  }
}

export async function runHubspotBatchSync(
  entity_type: HubspotEntityType | null,
  limit: number
): Promise<HubspotSyncConfig> {
  try {
    return apiPost<HubspotSyncConfig, { entity_type: HubspotEntityType | null; limit: number }>(
      '/api/hubspot-sync/run-batch',
      { entity_type, limit }
    );
  } catch (error) {
    throw error instanceof Error ? error : new Error('runHubspotBatchSync failed');
  }
}
