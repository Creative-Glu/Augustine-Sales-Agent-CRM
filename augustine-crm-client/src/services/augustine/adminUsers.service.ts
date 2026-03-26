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
  return apiGet<AdminUser[]>('/api/admin/users');
}

export interface CreateAdminUserInput {
  email: string;
  full_name: string;
  password: string;
  role: AdminUser['role'];
}

export async function createAdminUser(payload: CreateAdminUserInput): Promise<AdminUser> {
  return apiPost<AdminUser, CreateAdminUserInput>('/api/admin/users', payload);
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
  return apiPut<AdminUser, UpdateAdminUserInput>(`/api/admin/users/${id}`, payload);
}

export async function deleteAdminUser(id: number): Promise<void> {
  await apiDelete<unknown>(`/api/admin/users/${id}`);
}

