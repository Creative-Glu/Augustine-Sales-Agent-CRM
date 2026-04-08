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
  try {
    const raw = await apiGet<Role[] | { items: Role[]; count: number }>('/api/roles');
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray((raw as any).items)) return (raw as any).items as Role[];
    return [];
  } catch (error) {
    throw error instanceof Error ? error : new Error('listRoles failed');
  }
}

export async function getRole(id: number): Promise<Role> {
  try {
    return apiGet<Role>(`/api/roles/${id}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('getRole failed');
  }
}

export async function createRole(payload: CreateRoleInput): Promise<Role> {
  try {
    return apiPost<Role, CreateRoleInput>('/api/roles', payload);
  } catch (error) {
    throw error instanceof Error ? error : new Error('createRole failed');
  }
}

export async function updateRole(id: number, updates: UpdateRoleInput): Promise<Role> {
  try {
    return apiPut<Role, UpdateRoleInput>(`/api/roles/${id}`, updates);
  } catch (error) {
    throw error instanceof Error ? error : new Error('updateRole failed');
  }
}

export async function deleteRole(id: number): Promise<void> {
  try {
    await apiDelete<unknown>(`/api/roles/${id}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('deleteRole failed');
  }
}
