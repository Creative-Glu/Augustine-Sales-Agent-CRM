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
import { Users, RefreshCw, UserPlus, Eye, EyeOff, Pencil, KeyRound } from 'lucide-react';
import { createUserSchema, updateUserSchema } from '@/validations/adminUser.schema';
import type { ValidationError } from 'yup';

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
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setEditing(null);
    setEmail('');
    setFullName('');
    setPassword('');
    setRole('Reviewer');
    setIsActive(true);
    setShowPassword(false);
    setFieldErrors({});
  };

  const startEdit = (u: AdminUser) => {
    setEditing(u);
    setEmail(u.email);
    setFullName(u.full_name);
    setPassword('');
    setRole(u.role);
    setFieldErrors({});
    setIsActive(u.is_active);
    setShowPassword(false);
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    try {
      if (editing) {
        await updateUserSchema.validate(
          { fullName, password, role, isActive },
          { abortEarly: false }
        );
        updateMutation.mutate({ id: editing.id });
      } else {
        await createUserSchema.validate(
          { email: email.trim(), fullName, password, role },
          { abortEarly: false }
        );
        createMutation.mutate({
          email: email.trim(),
          full_name: fullName,
          password,
          role,
        });
      }
    } catch (err) {
      if ((err as ValidationError).inner) {
        const errors: Record<string, string> = {};
        for (const e of (err as ValidationError).inner) {
          if (e.path && !errors[e.path]) errors[e.path] = e.message;
        }
        setFieldErrors(errors);
      }
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
        <div className="px-6 py-20 flex justify-center">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center" style={{ minWidth: 360 }}>
            <div className="rounded-full bg-destructive/10 p-3 mx-auto mb-4 w-fit">
              <Users className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Access Denied</p>
            <p className="text-sm text-muted-foreground whitespace-normal">
              You do not have permission to view this page.<br />Ask an Admin to adjust your access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const users = usersQuery.data ?? [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

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
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Users ({users.length})
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={resetForm}
                  className="gap-1.5 transition-all duration-150"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  New User
                </Button>
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
            </div>
            <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/30 max-h-[500px] overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs text-muted-foreground bg-muted/50">
                    <th className="py-3 pl-4 pr-3 text-left font-medium">User</th>
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
                            <div className="h-4 w-40 rounded bg-muted/60 animate-pulse mb-1.5" />
                            <div className="h-3 w-28 rounded bg-muted/50 animate-pulse" />
                          </td>
                          <td className="py-3 px-3">
                            <div className="h-5 w-16 rounded bg-muted/50 animate-pulse" />
                          </td>
                          <td className="py-3 px-3">
                            <div className="h-5 w-14 rounded bg-muted/50 animate-pulse" />
                          </td>
                          <td className="py-3 pl-3 pr-4">
                            <div className="h-8 w-20 rounded bg-muted/50 animate-pulse ml-auto" />
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  {!usersQuery.isLoading && users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8">
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
                    users.map((u) => {
                      const isSelected = editing?.id === u.id;
                      const isSelf = user?.email === u.email;
                      return (
                        <tr
                          key={u.id}
                          className={`
                            border-b border-border/40 transition-colors duration-150
                            ${isSelected
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/30'
                              : 'hover:bg-muted/40'
                            }
                          `}
                        >
                          <td className="py-3 pl-4 pr-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-slate-800 dark:text-slate-100 text-sm">
                                {u.full_name || u.email}
                              </span>
                              <span className="text-xs text-muted-foreground">{u.email}</span>
                            </div>
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
                                  : 'inline-flex rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-medium px-2 py-1'
                              }
                            >
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 pl-3 pr-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={(e) => { e.stopPropagation(); startEdit(u); }}
                                title="Edit user"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>

          {/* ——— RIGHT: Create / Edit form ——— */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {editing ? `Edit: ${editing.full_name || editing.email}` : 'Create New User'}
              </h2>
              {editing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="text-xs text-muted-foreground"
                >
                  Cancel editing
                </Button>
              )}
            </div>
            <form className="space-y-6" onSubmit={onSubmit}>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Account Details
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
                      onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })); }}
                      disabled={!!editing}
                      placeholder="user@example.com"
                      className={`transition-[color,box-shadow] duration-150 ${fieldErrors.email ? 'border-destructive' : ''}`}
                    />
                    {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
                    {editing && !fieldErrors.email && (
                      <p className="text-[11px] text-muted-foreground">Email cannot be changed after creation.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                      htmlFor="user-name"
                    >
                      Full Name
                    </label>
                    <Input
                      id="user-name"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setFieldErrors((p) => ({ ...p, fullName: '' })); }}
                      placeholder="John Doe"
                      className={`transition-[color,box-shadow] duration-150 ${fieldErrors.fullName ? 'border-destructive' : ''}`}
                    />
                    {fieldErrors.fullName && <p className="text-xs text-destructive">{fieldErrors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                      htmlFor="user-password"
                    >
                      {editing ? (
                        <span className="flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5" />
                          Reset Password
                        </span>
                      ) : 'Password'}
                    </label>
                    <div className="relative">
                      <Input
                        id="user-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })); }}
                        placeholder={editing ? 'Leave blank to keep current' : 'Enter password'}
                        className={`pr-10 transition-[color,box-shadow] duration-150 ${fieldErrors.password ? 'border-destructive' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
                    {editing && !fieldErrors.password && (
                      <p className="text-[11px] text-muted-foreground">
                        Enter a new password to reset it, or leave blank to keep the current one.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 pt-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Permissions
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                      htmlFor="user-role"
                    >
                      Role
                    </label>
                    <Select value={role} onValueChange={(v) => { setRole(v as AdminUser['role']); setFieldErrors((p) => ({ ...p, role: '' })); }}>
                      <SelectTrigger
                        id="user-role"
                        className={`h-9 transition-[color,box-shadow] duration-150 ${fieldErrors.role ? 'border-destructive' : ''}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin — Full access</SelectItem>
                        <SelectItem value="Reviewer">Reviewer — Can review and edit</SelectItem>
                        <SelectItem value="Viewer">Viewer — Read-only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editing && (
                    <div className="space-y-2">
                      <label
                        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                        htmlFor="user-status"
                      >
                        Account Status
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
                          <SelectItem value="active">Active — Can log in</SelectItem>
                          <SelectItem value="inactive">Inactive — Cannot log in</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">
                        Deactivating a user prevents them from logging in without deleting their account.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-border/60 flex items-center justify-between gap-3">
                <div>
                  {editing && editing.created_at && (
                    <p className="text-[11px] text-muted-foreground">
                      Created {new Date(editing.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  {editing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={resetForm}
                      className="transition-all duration-150"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="default"
                    disabled={isSaving}
                    className="transition-all duration-150"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : editing ? null : (
                      <UserPlus className="w-4 h-4 mr-1.5" />
                    )}
                    {editing ? 'Save Changes' : 'Create User'}
                  </Button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>

    </div>
  );
}
