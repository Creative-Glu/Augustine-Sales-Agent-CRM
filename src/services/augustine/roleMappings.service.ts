import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/augustineApiClient';

export interface RoleMapping {
  mapping_id: number;
  job_title: string;
  role_id: number;
  role_name: string;
  role_slug: string;
  createdat: string;
  updatedat: string;
}

export interface CreateRoleMappingInput {
  job_title: string;
  role_id: number;
}

export type UpdateRoleMappingInput = Partial<CreateRoleMappingInput>;

export interface ApplyResult {
  updated_count: number;
  total_records: number;
}

export async function listRoleMappings(): Promise<RoleMapping[]> {
  try {
    const raw = await apiGet<RoleMapping[] | { items: RoleMapping[]; count: number }>('/api/role-mappings');
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray((raw as any).items)) return (raw as any).items as RoleMapping[];
    return [];
  } catch (error) {
    throw error instanceof Error ? error : new Error('listRoleMappings failed');
  }
}

export async function createRoleMapping(payload: CreateRoleMappingInput): Promise<RoleMapping> {
  try {
    return apiPost<RoleMapping, CreateRoleMappingInput>('/api/role-mappings', payload);
  } catch (error) {
    throw error instanceof Error ? error : new Error('createRoleMapping failed');
  }
}

export async function updateRoleMapping(id: number, updates: UpdateRoleMappingInput): Promise<RoleMapping> {
  try {
    return apiPut<RoleMapping, UpdateRoleMappingInput>(`/api/role-mappings/${id}`, updates);
  } catch (error) {
    throw error instanceof Error ? error : new Error('updateRoleMapping failed');
  }
}

export async function deleteRoleMapping(id: number): Promise<void> {
  try {
    await apiDelete<unknown>(`/api/role-mappings/${id}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('deleteRoleMapping failed');
  }
}

export interface JobTitleEntry {
  job_title: string;
  count: number;
}

export async function listJobTitles(): Promise<JobTitleEntry[]> {
  try {
    const raw = await apiGet<JobTitleEntry[] | { items: JobTitleEntry[]; count: number }>('/api/role-mappings/job-titles');
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray((raw as any).items)) return (raw as any).items as JobTitleEntry[];
    return [];
  } catch (error) {
    throw error instanceof Error ? error : new Error('listJobTitles failed');
  }
}

export async function applyRoleMappings(): Promise<ApplyResult> {
  try {
    return apiPost<ApplyResult>('/api/role-mappings/apply');
  } catch (error) {
    throw error instanceof Error ? error : new Error('applyRoleMappings failed');
  }
}
