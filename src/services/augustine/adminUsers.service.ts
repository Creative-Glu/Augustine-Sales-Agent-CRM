import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/augustineApiClient';

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: 'Admin' | 'Reviewer' | 'Viewer';
  is_active: boolean;
  created_at: string;
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  try {
    return apiGet<AdminUser[]>('/api/admin/users');
  } catch (error) {
    throw error instanceof Error ? error : new Error('listAdminUsers failed');
  }
}

export interface CreateAdminUserInput {
  email: string;
  full_name: string;
  password: string;
  role: AdminUser['role'];
}

export async function createAdminUser(payload: CreateAdminUserInput): Promise<AdminUser> {
  try {
    return apiPost<AdminUser, CreateAdminUserInput>('/api/admin/users', payload);
  } catch (error) {
    throw error instanceof Error ? error : new Error('createAdminUser failed');
  }
}

export type UpdateAdminUserInput = Partial<{
  full_name: string;
  password: string;
  role: AdminUser['role'];
  is_active: boolean;
}>;

export async function updateAdminUser(
  id: number,
  payload: UpdateAdminUserInput
): Promise<AdminUser> {
  try {
    return apiPut<AdminUser, UpdateAdminUserInput>(`/api/admin/users/${id}`, payload);
  } catch (error) {
    throw error instanceof Error ? error : new Error('updateAdminUser failed');
  }
}

export async function deleteAdminUser(id: number): Promise<void> {
  try {
    await apiDelete<unknown>(`/api/admin/users/${id}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('deleteAdminUser failed');
  }
}
