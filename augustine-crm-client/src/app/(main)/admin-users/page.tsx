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
import { Users, RefreshCw, UserPlus } from 'lucide-react';

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
    onError: (err: unknown) => {
      toast({
        title: 'Unable to create user',
        description: err instanceof Error ? err.message : 'Check API and try again.',
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
    onError: (err: unknown) => {
      toast({
        title: 'Unable to update user',
        description: err instanceof Error ? err.message : 'Check API and try again.',
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
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
        <Header
          title="User Management"
          subtitle="Only Admin users can manage accounts."
          icon={<Users className="w-6 h-6 text-white" />}
          showLive
        />
        <div className="px-6 py-8">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 max-w-lg">
            <p className="text-sm text-destructive">
              You do not have permission to view this page. Ask an Admin to adjust your access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const users = usersQuery.data ?? [];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <Header
        title="User Management"
        subtitle="Create and manage Augustine ops users."
        icon={<Users className="w-6 h-6 text-white" />}
        showLive
      />

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)] gap-6 items-start">
          {/* ——— LEFT: Users list ——— */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Users</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => usersQuery.refetch()}
                disabled={usersQuery.isLoading}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors duration-150"
                aria-label="Refresh users"
              >
                <RefreshCw
                  className={`w-4 h-4 ${usersQuery.isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
            <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/30 max-h-[400px] overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs text-muted-foreground bg-muted/50">
                    <th className="py-3 pl-4 pr-3 text-left font-medium">Email</th>
                    <th className="py-3 px-3 text-left font-medium">Name</th>
                    <th className="py-3 px-3 text-left font-medium">Role</th>
                    <th className="py-3 px-3 text-left font-medium">Status</th>
                    <th className="py-3 pl-3 pr-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersQuery.isLoading && (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b border-border/40">
                          <td className="py-3 pl-4 pr-3">
                            <div className="h-4 w-40 rounded bg-muted/60 animate-pulse" />
                          </td>
                          <td className="py-3 px-3">
                            <div className="h-4 w-28 rounded bg-muted/50 animate-pulse" />
                          </td>
                          <td className="py-3 px-3">
                            <div className="h-5 w-16 rounded bg-muted/50 animate-pulse" />
                          </td>
                          <td className="py-3 px-3">
                            <div className="h-5 w-14 rounded bg-muted/50 animate-pulse" />
                          </td>
                          <td className="py-3 pl-3 pr-4">
                            <div className="h-8 w-14 rounded bg-muted/50 animate-pulse ml-auto" />
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  {!usersQuery.isLoading && users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="rounded-full bg-muted/60 p-3 mb-3">
                            <Users className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            No users yet
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                            Create the first user with the form on the right.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!usersQuery.isLoading &&
                    users.map((u) => (
                      <tr
                        key={u.id}
                        className={`
                          border-b border-border/40 cursor-pointer transition-colors duration-150
                          ${editing?.id === u.id
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/30'
                            : 'hover:bg-muted/40'
                          }
                        `}
                        onClick={() => startEdit(u)}
                      >
                        <td className="py-3 pl-4 pr-3 font-medium text-slate-800 dark:text-slate-100">
                          {u.email}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground text-sm">
                          {u.full_name || '—'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={
                              u.role === 'Admin'
                                ? 'inline-flex rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-2 py-1'
                                : u.role === 'Reviewer'
                                  ? 'inline-flex rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-1'
                                  : 'inline-flex rounded-md border border-border bg-muted/50 text-muted-foreground text-xs font-medium px-2 py-1'
                            }
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={
                              u.is_active
                                ? 'inline-flex rounded-md border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 text-xs font-medium px-2 py-1'
                                : 'inline-flex rounded-md border border-border bg-muted/50 text-muted-foreground text-xs font-medium px-2 py-1'
                            }
                          >
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 pl-3 pr-4 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(u);
                            }}
                            className="transition-all duration-150"
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

          {/* ——— RIGHT: Create / Edit form ——— */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-6">
              {editing ? `Edit user: ${editing.email}` : 'Create user'}
            </h2>
            <form className="space-y-6" onSubmit={onSubmit}>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Basic info
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                      htmlFor="user-email"
                    >
                      Email
                    </label>
                    <Input
                      id="user-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!!editing}
                      required={!editing}
                      className="transition-[color,box-shadow] duration-150"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                      htmlFor="user-name"
                    >
                      Full name
                    </label>
                    <Input
                      id="user-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Optional"
                      className="transition-[color,box-shadow] duration-150"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                      htmlFor="user-password"
                    >
                      {editing ? 'New password (optional)' : 'Initial password'}
                    </label>
                    <Input
                      id="user-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={!editing}
                      className="transition-[color,box-shadow] duration-150"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 pt-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Access
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                      htmlFor="user-role"
                    >
                      Role
                    </label>
                    <Select value={role} onValueChange={(v) => setRole(v as AdminUser['role'])}>
                      <SelectTrigger
                        id="user-role"
                        className="h-9 transition-[color,box-shadow] duration-150"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Reviewer">Reviewer</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                      htmlFor="user-status"
                    >
                      Status
                    </label>
                    <Select
                      value={isActive ? 'active' : 'inactive'}
                      onValueChange={(v) => setIsActive(v === 'active')}
                    >
                      <SelectTrigger
                        id="user-status"
                        className="h-9 transition-[color,box-shadow] duration-150"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/60 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={resetForm}
                  className="transition-all duration-150"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="default"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="transition-all duration-150"
                >
                  {editing ? (
                    'Save changes'
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Create user
                    </>
                  )}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
