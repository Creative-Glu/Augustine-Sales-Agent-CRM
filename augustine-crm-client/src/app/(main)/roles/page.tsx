'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  type Role,
} from '@/services/augustine/roles.service';
import {
  listRoleMappings,
  createRoleMapping,
  updateRoleMapping,
  deleteRoleMapping,
  applyRoleMappings,
  listJobTitles,
  type RoleMapping,
} from '@/services/augustine/roleMappings.service';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import {
  Shield,
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowRight,
  RefreshCw,
  ArrowRightLeft,
} from 'lucide-react';

export default function RolesPage() {
  const { toast } = useToast();

  /* ══════════════════════════════════════════
     SECTION A — ROLES MASTER LIST
     ══════════════════════════════════════════ */
  const [editing, setEditing] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [searchRoles, setSearchRoles] = useState('');
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<Role | null>(null);
  const [deleteMappingTarget, setDeleteMappingTarget] = useState<RoleMapping | null>(null);

  const rolesQuery = useQuery({
    queryKey: ['augustine', 'roles', 'list'],
    queryFn: listRoles,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: number; slug: string; name: string }) => {
      if (payload.id != null) {
        return updateRole(payload.id, { slug: payload.slug, name: payload.name });
      }
      return createRole({ slug: payload.slug, name: payload.name });
    },
    onSuccess: (_data, vars) => {
      toast({
        title: vars.id != null ? 'Role updated' : 'Role created',
        description: `"${vars.name}" has been saved.`,
      });
      rolesQuery.refetch();
      resetRoleForm();
    },
    onError: (err: any) => {
      const isDuplicate = err?.status === 409;
      toast({
        title: isDuplicate ? 'Duplicate slug' : 'Unable to save role',
        description: isDuplicate
          ? `A role with slug "${slug}" already exists.`
          : err?.message ?? 'Check API and try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      toast({ title: 'Role deleted' });
      rolesQuery.refetch();
      mappingsQuery.refetch();
      resetRoleForm();
      setDeleteRoleTarget(null);
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to delete role',
        description: err?.message ?? 'Try again later.',
        variant: 'destructive',
      });
    },
  });

  const resetRoleForm = () => {
    setEditing(null);
    setName('');
    setSlug('');
  };

  const startEdit = (role: Role) => {
    setEditing(role);
    setName(role.name);
    setSlug(role.slug);
  };

  const autoSlug = (value: string) => {
    setName(value);
    if (!editing) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const onSaveRole = () => {
    if (!name.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    if (!slug.trim()) {
      toast({ title: 'Slug required', variant: 'destructive' });
      return;
    }
    saveMutation.mutate({ id: editing?.role_id, slug: slug.trim(), name: name.trim() });
  };

  const roles = rolesQuery.data ?? [];
  const filteredRoles = searchRoles
    ? roles.filter(
        (r) =>
          r.name.toLowerCase().includes(searchRoles.toLowerCase()) ||
          r.slug.toLowerCase().includes(searchRoles.toLowerCase())
      )
    : roles;

  /* ══════════════════════════════════════════
     SECTION B — JOB TITLE → ROLE MAPPINGS
     ══════════════════════════════════════════ */
  const [editingMapping, setEditingMapping] = useState<RoleMapping | null>(null);
  const [mapJobTitle, setMapJobTitle] = useState('');
  const [mapRoleId, setMapRoleId] = useState<number | ''>('');
  const [searchMappings, setSearchMappings] = useState('');
  const [jobTitleMode, setJobTitleMode] = useState<'select' | 'custom'>('select');

  const mappingsQuery = useQuery({
    queryKey: ['augustine', 'role-mappings', 'list'],
    queryFn: listRoleMappings,
  });

  const jobTitlesQuery = useQuery({
    queryKey: ['augustine', 'role-mappings', 'job-titles'],
    queryFn: listJobTitles,
  });

  const jobTitles = jobTitlesQuery.data ?? [];

  const saveMappingMutation = useMutation({
    mutationFn: async (payload: { id?: number; job_title: string; role_id: number }) => {
      if (payload.id != null) {
        return updateRoleMapping(payload.id, {
          job_title: payload.job_title,
          role_id: payload.role_id,
        });
      }
      return createRoleMapping({ job_title: payload.job_title, role_id: payload.role_id });
    },
    onSuccess: (_data, vars) => {
      toast({
        title: vars.id != null ? 'Mapping updated' : 'Mapping created',
        description: `"${vars.job_title}" mapping saved.`,
      });
      mappingsQuery.refetch();
      resetMappingForm();
    },
    onError: (err: any) => {
      const isDuplicate = err?.status === 409;
      const notFound = err?.status === 404;
      toast({
        title: isDuplicate
          ? 'Duplicate job title'
          : notFound
            ? 'Role not found'
            : 'Unable to save mapping',
        description: isDuplicate
          ? `"${mapJobTitle}" is already mapped. Edit the existing mapping instead.`
          : notFound
            ? 'The selected role no longer exists.'
            : err?.message ?? 'Check API and try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMappingMutation = useMutation({
    mutationFn: (id: number) => deleteRoleMapping(id),
    onSuccess: () => {
      toast({ title: 'Mapping deleted' });
      mappingsQuery.refetch();
      resetMappingForm();
      setDeleteMappingTarget(null);
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to delete mapping',
        description: err?.message ?? 'Try again later.',
        variant: 'destructive',
      });
    },
  });

  const applyMutation = useMutation({
    mutationFn: applyRoleMappings,
    onSuccess: (data) => {
      toast({
        title: 'Mappings applied to existing records',
        description: `${data.updated_count.toLocaleString()} of ${data.total_records.toLocaleString()} records updated.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to apply mappings',
        description: err?.message ?? 'Try again later.',
        variant: 'destructive',
      });
    },
  });

  const resetMappingForm = () => {
    setEditingMapping(null);
    setMapJobTitle('');
    setMapRoleId('');
    setJobTitleMode('select');
  };

  const startEditMapping = (m: RoleMapping) => {
    setEditingMapping(m);
    setMapJobTitle(m.job_title);
    setMapRoleId(m.role_id);
    setJobTitleMode('custom');
  };

  const onSaveMapping = () => {
    if (!mapJobTitle.trim()) {
      toast({ title: 'Job title required', variant: 'destructive' });
      return;
    }
    if (!mapRoleId) {
      toast({ title: 'Select a role', variant: 'destructive' });
      return;
    }
    saveMappingMutation.mutate({
      id: editingMapping?.mapping_id,
      job_title: mapJobTitle.trim(),
      role_id: Number(mapRoleId),
    });
  };

  const mappings = mappingsQuery.data ?? [];
  const filteredMappings = searchMappings
    ? mappings.filter(
        (m) =>
          m.job_title.toLowerCase().includes(searchMappings.toLowerCase()) ||
          m.role_name.toLowerCase().includes(searchMappings.toLowerCase())
      )
    : mappings;

  /* ══════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <Header
        title="Parish Role Management"
        subtitle="Manage standardized parish roles and job-title mapping rules."
        icon={<Shield className="w-6 h-6 text-white" />}
        showLive
      />

      <div className="px-6 py-8 space-y-8">
        {/* ═══════════════════════════════════════════
            ROW 1 — ROLES MASTER LIST + ROLE FORM
            ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-6 items-start">
          {/* ——— LEFT: ROLE LIST ——— */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Roles ({roles.length})
              </h2>
              <Button type="button" size="sm" onClick={resetRoleForm} className="transition-all duration-150 ease-out">
                <Plus className="w-4 h-4" />
                New Role
              </Button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchRoles}
                onChange={(e) => setSearchRoles(e.target.value)}
                placeholder="Search roles…"
                className="pl-9 transition-[color,box-shadow] duration-150"
              />
            </div>

            <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/30 max-h-[420px] overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-[1]">
                  <tr className="border-b border-border/60 text-xs text-muted-foreground bg-muted/50">
                    <th className="py-3 pl-4 pr-3 text-left font-medium">Name</th>
                    <th className="py-3 px-3 text-left font-medium">Slug</th>
                    <th className="py-3 pl-3 pr-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rolesQuery.isLoading && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                        Loading roles…
                      </td>
                    </tr>
                  )}
                  {!rolesQuery.isLoading && filteredRoles.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="rounded-full bg-muted/60 p-3 mb-3">
                            <Shield className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {searchRoles ? 'No matching roles' : 'No roles yet'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                            {searchRoles
                              ? 'Try a different search term.'
                              : 'Add your first parish role to get started.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!rolesQuery.isLoading &&
                    filteredRoles.map((role) => (
                      <tr
                        key={role.role_id}
                        className={`border-b border-border/40 last:border-0 transition-colors duration-150 ease-out hover:bg-muted/40 ${
                          editing?.role_id === role.role_id ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                        }`}
                      >
                        <td className="py-3 pl-4 pr-3">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{role.name}</p>
                        </td>
                        <td className="py-3 px-3">
                          <code className="text-xs bg-muted/60 px-2 py-0.5 rounded text-muted-foreground">
                            {role.slug}
                          </code>
                        </td>
                        <td className="py-3 pl-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => startEdit(role)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                              onClick={() => setDeleteRoleTarget(role)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ——— RIGHT: ROLE FORM ——— */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-6">
              {editing ? `Edit Role: ${editing.name}` : 'New Role'}
            </h2>

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Role details
            </p>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="role-name">
                  Name
                </label>
                <Input
                  id="role-name"
                  value={name}
                  onChange={(e) => autoSlug(e.target.value)}
                  placeholder="e.g. Youth Ministry"
                  className="transition-[color,box-shadow] duration-150"
                />
                <p className="text-xs text-muted-foreground">The display name for this parish role.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="role-slug">
                  Slug
                </label>
                <Input
                  id="role-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. youth-ministry"
                  className="transition-[color,box-shadow] duration-150"
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier. Auto-generated from name for new roles.
                </p>
              </div>
            </div>

            {editing && (
              <div className="border-t border-border/60 pt-4 mb-6">
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(editing.createdat).toLocaleDateString()} · Updated:{' '}
                  {new Date(editing.updatedat).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border/60 flex justify-end gap-3">
              {editing && (
                <Button type="button" variant="outline" onClick={resetRoleForm}>
                  Cancel
                </Button>
              )}
              <Button type="button" onClick={onSaveRole} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving…' : editing ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </section>
        </div>

        {/* ═══════════════════════════════════════════
            ROW 2 — JOB TITLE MAPPINGS + MAPPING FORM
            ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-6 items-start">
          {/* ——— LEFT: MAPPING TABLE ——— */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Job Title Mappings ({mappings.length})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending || mappings.length === 0}
                  className="transition-all duration-150 ease-out"
                >
                  <RefreshCw className={`w-4 h-4 ${applyMutation.isPending ? 'animate-spin' : ''}`} />
                  {applyMutation.isPending ? 'Applying…' : 'Apply to All Records'}
                </Button>
                <Button type="button" size="sm" onClick={resetMappingForm} className="transition-all duration-150 ease-out">
                  <Plus className="w-4 h-4" />
                  New Mapping
                </Button>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchMappings}
                onChange={(e) => setSearchMappings(e.target.value)}
                placeholder="Search mappings…"
                className="pl-9 transition-[color,box-shadow] duration-150"
              />
            </div>

            <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/30 max-h-[420px] overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-[1]">
                  <tr className="border-b border-border/60 text-xs text-muted-foreground bg-muted/50">
                    <th className="py-3 pl-4 pr-3 text-left font-medium">Job Title</th>
                    <th className="py-3 px-3 text-center font-medium w-10"></th>
                    <th className="py-3 px-3 text-left font-medium">Parish Role</th>
                    <th className="py-3 pl-3 pr-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mappingsQuery.isLoading && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                        Loading mappings…
                      </td>
                    </tr>
                  )}
                  {!mappingsQuery.isLoading && filteredMappings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="rounded-full bg-muted/60 p-3 mb-3">
                            <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {searchMappings ? 'No matching mappings' : 'No mappings yet'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
                            {searchMappings
                              ? 'Try a different search term.'
                              : 'Map job titles from the website to standardized parish roles.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!mappingsQuery.isLoading &&
                    filteredMappings.map((m) => (
                      <tr
                        key={m.mapping_id}
                        className={`border-b border-border/40 last:border-0 transition-colors duration-150 ease-out hover:bg-muted/40 ${
                          editingMapping?.mapping_id === m.mapping_id
                            ? 'bg-blue-50/60 dark:bg-blue-950/30'
                            : ''
                        }`}
                      >
                        <td className="py-3 pl-4 pr-3">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{m.job_title}</p>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto" />
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-1">
                            {m.role_name}
                          </span>
                        </td>
                        <td className="py-3 pl-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => startEditMapping(m)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                              onClick={() => setDeleteMappingTarget(m)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ——— RIGHT: MAPPING FORM ——— */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-6">
              {editingMapping ? `Edit Mapping: ${editingMapping.job_title}` : 'New Mapping'}
            </h2>

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Mapping rule
            </p>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    htmlFor="map-job-title"
                  >
                    Job Title
                  </label>
                  <div className="flex items-center gap-1 rounded-lg border border-border/60 p-0.5 bg-muted/30">
                    <button
                      type="button"
                      onClick={() => { setJobTitleMode('select'); setMapJobTitle(''); }}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                        jobTitleMode === 'select'
                          ? 'bg-background text-slate-800 dark:text-slate-100 shadow-sm'
                          : 'text-muted-foreground hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      From DB
                    </button>
                    <button
                      type="button"
                      onClick={() => { setJobTitleMode('custom'); setMapJobTitle(''); }}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                        jobTitleMode === 'custom'
                          ? 'bg-background text-slate-800 dark:text-slate-100 shadow-sm'
                          : 'text-muted-foreground hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                {jobTitleMode === 'select' ? (
                  <>
                    <select
                      id="map-job-title"
                      value={mapJobTitle}
                      onChange={(e) => setMapJobTitle(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-[color,box-shadow] duration-150"
                    >
                      <option value="">Select an existing job title…</option>
                      {jobTitles.map((jt) => (
                        <option key={jt.job_title} value={jt.job_title}>
                          {jt.job_title} ({jt.count} record{jt.count !== 1 ? 's' : ''})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Pick from job titles already in the database.
                    </p>
                  </>
                ) : (
                  <>
                    <Input
                      id="map-job-title"
                      value={mapJobTitle}
                      onChange={(e) => setMapJobTitle(e.target.value)}
                      placeholder="e.g. Director of Youth Education"
                      className="transition-[color,box-shadow] duration-150"
                    />
                    <p className="text-xs text-muted-foreground">
                      Type a custom job title to create a new mapping rule.
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  htmlFor="map-role"
                >
                  Maps to Parish Role
                </label>
                <select
                  id="map-role"
                  value={mapRoleId}
                  onChange={(e) => setMapRoleId(e.target.value ? Number(e.target.value) : '')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-[color,box-shadow] duration-150"
                >
                  <option value="">Select a role…</option>
                  {roles.map((r) => (
                    <option key={r.role_id} value={r.role_id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  The standardized parish role this job title should map to.
                </p>
              </div>
            </div>

            {/* Visual preview */}
            {mapJobTitle && mapRoleId && (
              <div className="border border-border/60 rounded-xl bg-muted/20 p-4 mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Preview
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    &ldquo;{mapJobTitle}&rdquo;
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="inline-flex items-center rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-1">
                    {roles.find((r) => r.role_id === Number(mapRoleId))?.name ?? '—'}
                  </span>
                </div>
              </div>
            )}

            {editingMapping && (
              <div className="border-t border-border/60 pt-4 mb-6">
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(editingMapping.createdat).toLocaleDateString()} · Updated:{' '}
                  {new Date(editingMapping.updatedat).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border/60 flex justify-end gap-3">
              {editingMapping && (
                <Button type="button" variant="outline" onClick={resetMappingForm}>
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                onClick={onSaveMapping}
                disabled={saveMappingMutation.isPending}
              >
                {saveMappingMutation.isPending
                  ? 'Saving…'
                  : editingMapping
                    ? 'Update Mapping'
                    : 'Create Mapping'}
              </Button>
            </div>
          </section>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={!!deleteRoleTarget}
        onOpenChange={(open) => { if (!open) setDeleteRoleTarget(null); }}
        title={`Delete "${deleteRoleTarget?.name}"?`}
        description="This role will be permanently removed. Any job title mappings using this role will also be deleted."
        onConfirm={() => { if (deleteRoleTarget) deleteRoleMutation.mutate(deleteRoleTarget.role_id); }}
        loading={deleteRoleMutation.isPending}
        error={deleteRoleMutation.error instanceof Error ? deleteRoleMutation.error.message : null}
      />

      <ConfirmDeleteDialog
        open={!!deleteMappingTarget}
        onOpenChange={(open) => { if (!open) setDeleteMappingTarget(null); }}
        title={`Delete mapping for "${deleteMappingTarget?.job_title}"?`}
        description={`The mapping "${deleteMappingTarget?.job_title}" → "${deleteMappingTarget?.role_name}" will be permanently removed.`}
        onConfirm={() => { if (deleteMappingTarget) deleteMappingMutation.mutate(deleteMappingTarget.mapping_id); }}
        loading={deleteMappingMutation.isPending}
        error={deleteMappingMutation.error instanceof Error ? deleteMappingMutation.error.message : null}
      />
    </div>
  );
}
