import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/augustineApiClient';

export interface Role {
  role_id: number;
  slug: string;
  name: string;
  createdat: string;
  updatedat: string;
}

export interface CreateRoleInput {
  slug: string;
  name: string;
}

export type UpdateRoleInput = Partial<CreateRoleInput>;

export async function listRoles(): Promise<Role[]> {
  const raw = await apiGet<Role[] | { items: Role[]; count: number }>('/api/roles');
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray((raw as any).items)) return (raw as any).items as Role[];
  return [];
}

export async function getRole(id: number): Promise<Role> {
  return apiGet<Role>(`/api/roles/${id}`);
}

export async function createRole(payload: CreateRoleInput): Promise<Role> {
  return apiPost<Role, CreateRoleInput>('/api/roles', payload);
}

export async function updateRole(id: number, updates: UpdateRoleInput): Promise<Role> {
  return apiPut<Role, UpdateRoleInput>(`/api/roles/${id}`, updates);
}

export async function deleteRole(id: number): Promise<void> {
  await apiDelete<unknown>(`/api/roles/${id}`);
}
