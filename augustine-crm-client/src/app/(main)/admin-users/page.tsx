'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  type AdminUser,
} from '@/services/augustine/adminUsers.service';
import { useAuth } from '@/providers/AuthProvider';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: listAdminUsers,
    enabled: user?.role === 'Admin',
  });

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminUser['role']>('Reviewer');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditing(null);
    setEmail('');
    setFullName('');
    setPassword('');
    setRole('Reviewer');
    setIsActive(true);
  };

  const startEdit = (u: AdminUser) => {
    setEditing(u);
    setEmail(u.email);
    setFullName(u.full_name);
    setPassword('');
    setRole(u.role);
    setIsActive(u.is_active);
  };

  const createMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      toast({ title: 'User created' });
      usersQuery.refetch();
      resetForm();
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to create user',
        description: err?.message ?? 'Check API and try again.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number }) =>
      updateAdminUser(payload.id, {
        full_name: fullName || undefined,
        password: password || undefined,
        role,
        is_active: isActive,
      }),
    onSuccess: () => {
      toast({ title: 'User updated' });
      usersQuery.refetch();
      resetForm();
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to update user',
        description: err?.message ?? 'Check API and try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id });
    } else {
      if (!email.trim() || !password.trim()) {
        toast({
          title: 'Email and password required',
          variant: 'destructive',
        });
        return;
      }
      createMutation.mutate({
        email: email.trim(),
        full_name: fullName || email.trim(),
        password,
        role,
      });
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="space-y-4">
        <Header
          title="User management"
          subtitle="Only Admin users can manage accounts."
          icon={<span className="text-white text-lg font-semibold">UM</span>}
          showLive
        />
        <p className="text-sm text-destructive">
          You do not have permission to view this page. Ask an Admin to adjust your access.
        </p>
      </div>
    );
  }

  const users = usersQuery.data ?? [];

  return (
    <div className="space-y-6">
      <Header
        title="User management"
        subtitle="Create and manage Augustine ops users."
        icon={<span className="text-white text-lg font-semibold">UM</span>}
        showLive
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)] gap-6 items-start">
        <section className="bg-card rounded-xl border border-border shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Users</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => usersQuery.refetch()}>
              Refresh
            </Button>
          </div>
          <div className="border border-border/60 rounded-lg max-h-[360px] overflow-y-auto bg-muted/40">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/70 border-b border-border/60">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.isLoading && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                      Loading users…
                    </td>
                  </tr>
                )}
                {!usersQuery.isLoading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                      No users found. Create one on the right.
                    </td>
                  </tr>
                )}
                {!usersQuery.isLoading &&
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-border/40">
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">{u.full_name}</td>
                      <td className="px-3 py-2 text-[11px] capitalize">{u.role}</td>
                      <td className="px-3 py-2 text-[11px]">
                        {u.is_active ? 'Active' : 'Inactive'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => startEdit(u)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-semibold">
            {editing ? `Edit user: ${editing.email}` : 'Create user'}
          </h2>
          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="space-y-1 text-xs">
              <label className="block text-muted-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!editing}
                required={!editing}
              />
            </div>
            <div className="space-y-1 text-xs">
              <label className="block text-muted-foreground">Full name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1 text-xs">
              <label className="block text-muted-foreground">
                {editing ? 'New password (optional)' : 'Initial password'}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!editing}
              />
            </div>
            <div className="space-y-1 text-xs">
              <label className="block text-muted-foreground">Role</label>
              <Select value={role} onValueChange={(v) => setRole(v as AdminUser['role'])}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Reviewer">Reviewer</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 text-xs">
              <label className="block text-muted-foreground">Status</label>
              <Select
                value={isActive ? 'active' : 'inactive'}
                onValueChange={(v) => setIsActive(v === 'active')}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editing ? 'Save changes' : 'Create user'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

