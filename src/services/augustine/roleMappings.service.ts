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
  const raw = await apiGet<RoleMapping[] | { items: RoleMapping[]; count: number }>('/api/role-mappings');
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray((raw as any).items)) return (raw as any).items as RoleMapping[];
  return [];
}

export async function createRoleMapping(payload: CreateRoleMappingInput): Promise<RoleMapping> {
  return apiPost<RoleMapping, CreateRoleMappingInput>('/api/role-mappings', payload);
}

export async function updateRoleMapping(id: number, updates: UpdateRoleMappingInput): Promise<RoleMapping> {
  return apiPut<RoleMapping, UpdateRoleMappingInput>(`/api/role-mappings/${id}`, updates);
}

export async function deleteRoleMapping(id: number): Promise<void> {
  await apiDelete<unknown>(`/api/role-mappings/${id}`);
}

export interface JobTitleEntry {
  job_title: string;
  count: number;
}

export async function listJobTitles(): Promise<JobTitleEntry[]> {
  const raw = await apiGet<JobTitleEntry[] | { items: JobTitleEntry[]; count: number }>('/api/role-mappings/job-titles');
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray((raw as any).items)) return (raw as any).items as JobTitleEntry[];
  return [];
}

export async function applyRoleMappings(): Promise<ApplyResult> {
  return apiPost<ApplyResult>('/api/role-mappings/apply');
}
