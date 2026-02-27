import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/augustineApiClient';
import type { Icp } from '@/types/augustine';

export async function listIcps(): Promise<Icp[]> {
  const raw = await apiGet<Icp[] | { items: Icp[] }>('/api/icp');
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray((raw as any).items)) return (raw as any).items as Icp[];
  return [];
}

export interface CreateIcpInput {
  name: string;
  description?: string | null;
  is_active?: boolean;
  filters: Icp['filters'];
}

export async function createIcp(payload: CreateIcpInput): Promise<Icp> {
  return apiPost<Icp, CreateIcpInput>('/api/icp', payload);
}

export async function getIcp(id: string | number): Promise<Icp> {
  return apiGet<Icp>(`/api/icp/${id}`);
}

export type UpdateIcpInput = Partial<CreateIcpInput>;

export async function updateIcp(id: string | number, updates: UpdateIcpInput): Promise<Icp> {
  return apiPut<Icp, UpdateIcpInput>(`/api/icp/${id}`, updates);
}

export async function deleteIcp(id: string | number): Promise<void> {
  await apiDelete<unknown>(`/api/icp/${id}`);
}

