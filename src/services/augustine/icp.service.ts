import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/augustineApiClient';
import type { Icp } from '@/types/augustine';

export async function listIcps(): Promise<Icp[]> {
  try {
    const raw = await apiGet<Icp[] | { items: Icp[] }>('/api/icp');
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray((raw as any).items)) return (raw as any).items as Icp[];
    return [];
  } catch (error) {
    throw error instanceof Error ? error : new Error('listIcps failed');
  }
}

export interface CreateIcpInput {
  name: string;
  description?: string | null;
  is_active?: boolean;
  filters: Icp['filters'];
}

export async function createIcp(payload: CreateIcpInput): Promise<Icp> {
  try {
    return apiPost<Icp, CreateIcpInput>('/api/icp', payload);
  } catch (error) {
    throw error instanceof Error ? error : new Error('createIcp failed');
  }
}

export async function getIcp(id: string | number): Promise<Icp> {
  try {
    return apiGet<Icp>(`/api/icp/${id}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('getIcp failed');
  }
}

export type UpdateIcpInput = Partial<CreateIcpInput>;

export async function updateIcp(id: string | number, updates: UpdateIcpInput): Promise<Icp> {
  try {
    return apiPut<Icp, UpdateIcpInput>(`/api/icp/${id}`, updates);
  } catch (error) {
    throw error instanceof Error ? error : new Error('updateIcp failed');
  }
}

export async function deleteIcp(id: string | number): Promise<void> {
  try {
    await apiDelete<unknown>(`/api/icp/${id}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('deleteIcp failed');
  }
}
