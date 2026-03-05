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
  return apiGet<HubspotSyncConfig>('/api/hubspot-sync/config');
}

export async function updateHubspotSyncConfig(
  enabled: boolean
): Promise<HubspotSyncConfig> {
  return apiPost<HubspotSyncConfig, { enabled: boolean }>(
    '/api/hubspot-sync/config',
    { enabled }
  );
}

export async function getHubspotExtendedHealth(): Promise<HubspotExtendedHealth> {
  return apiGet<HubspotExtendedHealth>('/api/hubspot-health');
}

export async function runHubspotSingleSync(
  entity_type: HubspotEntityType,
  entity_id: number
): Promise<HubspotSyncConfig> {
  return apiPost<HubspotSyncConfig, { entity_type: HubspotEntityType; entity_id: number }>(
    '/api/hubspot-sync/run',
    { entity_type, entity_id }
  );
}

export async function runHubspotBatchSync(
  entity_type: HubspotEntityType | null,
  limit: number
): Promise<HubspotSyncConfig> {
  return apiPost<HubspotSyncConfig, { entity_type: HubspotEntityType | null; limit: number }>(
    '/api/hubspot-sync/run-batch',
    { entity_type, limit }
  );
}


