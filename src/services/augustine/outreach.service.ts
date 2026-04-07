import { apiGet, apiPost, apiPut } from '@/lib/augustineApiClient';
import type {
  OutreachItem,
  OutreachListResponse,
  OutreachBulkGenerateResponse,
} from '@/types/augustine';

export interface OutreachListParams {
  limit?: number;
  statuses?: string;
}

export async function listOutreach(params: OutreachListParams = {}): Promise<OutreachListResponse> {
  const sp = new URLSearchParams();
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.statuses) sp.set('statuses', params.statuses);
  const qs = sp.toString();
  const path = qs ? `/api/outreach?${qs}` : '/api/outreach';
  return apiGet<OutreachListResponse>(path);
}

export async function listPendingOutreach(limit = 50): Promise<OutreachListResponse> {
  const sp = new URLSearchParams();
  sp.set('limit', String(limit));
  const path = `/api/outreach/pending?${sp.toString()}`;
  return apiGet<OutreachListResponse>(path);
}

export async function getOutreach(id: number | string): Promise<OutreachItem> {
  return apiGet<OutreachItem>(`/api/outreach/${id}`);
}

export interface EditOutreachInput {
  subject?: string;
  body?: string;
}

export async function editOutreach(
  id: number | string,
  payload: EditOutreachInput
): Promise<OutreachItem> {
  return apiPut<OutreachItem, EditOutreachInput>(`/api/outreach/${id}/edit`, payload);
}

export async function approveOutreach(
  id: number | string,
  approvedBy: string
): Promise<OutreachItem> {
  return apiPost<OutreachItem, { approved_by: string }>(`/api/outreach/${id}/approve`, {
    approved_by: approvedBy,
  });
}

export async function rejectOutreach(
  id: number | string,
  rejectionReason?: string
): Promise<OutreachItem> {
  return apiPost<OutreachItem, { rejection_reason?: string }>(
    `/api/outreach/${id}/reject`,
    rejectionReason ? { rejection_reason: rejectionReason } : {}
  );
}

export async function regenerateOutreach(id: number | string): Promise<OutreachItem> {
  return apiPost<OutreachItem, Record<string, never>>(`/api/outreach/${id}/regenerate`, {});
}

export async function sendOutreach(id: number | string): Promise<OutreachItem> {
  return apiPost<OutreachItem, Record<string, never>>(`/api/outreach/${id}/send`, {});
}

export interface OutreachGenerateInput {
  contact_id: number;
  campaign_id: number;
  idempotency_key?: string;
}

export async function generateOutreach(
  payload: OutreachGenerateInput
): Promise<OutreachItem> {
  return apiPost<OutreachItem, OutreachGenerateInput>('/api/outreach/generate', payload);
}

export interface OutreachBulkGenerateInput {
  limit?: number;
}

export async function bulkGenerateOutreach(
  payload: OutreachBulkGenerateInput
): Promise<OutreachBulkGenerateResponse> {
  return apiPost<OutreachBulkGenerateResponse, OutreachBulkGenerateInput>(
    '/api/outreach/generate/bulk',
    payload
  );
}

/** Campaign-driven generate: creates drafts for the given campaign only. Campaign must be active and have an ICP. */
export interface OutreachGenerateForCampaignInput {
  campaign_id: number;
  limit?: number;
}

export async function generateOutreachForCampaign(
  payload: OutreachGenerateForCampaignInput
): Promise<OutreachBulkGenerateResponse> {
  return apiPost<OutreachBulkGenerateResponse, OutreachGenerateForCampaignInput>(
    '/api/outreach/generate',
    payload
  );
}

