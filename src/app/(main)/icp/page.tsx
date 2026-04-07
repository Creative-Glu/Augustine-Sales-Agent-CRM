'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { listIcps, createIcp, updateIcp, deleteIcp } from '@/services/augustine/icp.service';
import type { IcpFilters, Icp } from '@/types/augustine';
import { Target, Plus } from 'lucide-react';

export default function ICPPage() {
  const { toast } = useToast();
  const [editing, setEditing] = useState<Icp | null>(null);
  const icpsQuery = useQuery({
    queryKey: ['augustine', 'icp', 'list'],
    queryFn: listIcps,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      id?: Icp['id'];
      name: string;
      description?: string | null;
      is_active: boolean;
      filters: IcpFilters;
    }) => {
      if (payload.id != null) {
        return updateIcp(payload.id, {
          name: payload.name,
          description: payload.description,
          is_active: payload.is_active,
          filters: payload.filters,
        });
      }
      return createIcp({
        name: payload.name,
        description: payload.description,
        is_active: payload.is_active,
        filters: payload.filters,
      });
    },
    onSuccess: () => {
      toast({ title: 'ICP saved', description: 'Changes saved to backend.' });
      icpsQuery.refetch();
      setEditing(null);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Unable to save ICP',
        description: err instanceof Error ? err.message : 'Check API and try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: Icp['id']) => deleteIcp(id),
    onSuccess: () => {
      toast({ title: 'ICP deleted' });
      icpsQuery.refetch();
    },
    onError: (err: unknown) => {
      toast({
        title: 'Unable to delete ICP',
        description: err instanceof Error ? err.message : 'Try again later.',
        variant: 'destructive',
      });
    },
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [institutionType, setInstitutionType] = useState('');
  const [staffRoleContains, setStaffRoleContains] = useState('');
  const [minConfidence, setMinConfidence] = useState<number | ''>('');
  const [enrichmentStatus, setEnrichmentStatus] = useState('');

  const startCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setInstitutionType('');
    setStaffRoleContains('');
    setMinConfidence('');
    setEnrichmentStatus('');
  };

  const startEdit = (icp: Icp) => {
    setEditing(icp);
    setName(icp.name);
    setDescription(icp.description ?? '');
    setIsActive(icp.is_active);
    setInstitutionType(icp.filters.institution_type ?? '');
    setStaffRoleContains(icp.filters.staff_role_contains ?? '');
    setMinConfidence(icp.filters.min_confidence_score ?? '');
    setEnrichmentStatus(icp.filters.enrichment_status ?? '');
  };

  const onSave = () => {
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Give this ICP a clear, marketing-friendly name.',
        variant: 'destructive',
      });
      return;
    }
    const filters: IcpFilters = {
      institution_type: institutionType || null,
      staff_role_contains: staffRoleContains || null,
      min_confidence_score: minConfidence === '' ? null : Number(minConfidence),
      enrichment_status: enrichmentStatus || null,
    };
    saveMutation.mutate({
      id: editing?.id,
      name,
      description: description || null,
      is_active: isActive,
      filters,
    });
  };

  const icps = icpsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <Header
        title="ICP Management"
        subtitle="Define and edit Ideal Customer Profiles used for outreach generation."
        icon={<Target className="w-6 h-6 text-white" />}
        showLive
      />

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1.4fr)] gap-6 items-start">
          {/* ——— LEFT PANEL: ICP LIST ——— */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">ICPs</h2>
              <Button type="button" size="sm" onClick={startCreate} className="transition-all duration-150 ease-out">
                <Plus className="w-4 h-4" />
                New ICP
              </Button>
            </div>
            <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/30">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs text-muted-foreground bg-muted/50">
                    <th className="py-3 pl-4 pr-3 text-left font-medium">Name</th>
                    <th className="py-3 px-3 text-left font-medium">Active</th>
                    <th className="py-3 px-3 text-left font-medium">Filters</th>
                    <th className="py-3 pl-3 pr-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {icpsQuery.isLoading && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                        Loading ICPs…
                      </td>
                    </tr>
                  )}
                  {!icpsQuery.isLoading && icps.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="rounded-full bg-muted/60 p-3 mb-3">
                            <Target className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No ICPs yet</p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                            Create your first Ideal Customer Profile to target outreach.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!icpsQuery.isLoading &&
                    icps.map((icp) => (
                      <tr
                        key={icp.id}
                        className="border-b border-border/40 last:border-0 transition-colors duration-150 ease-out hover:bg-muted/40"
                      >
                        <td className="py-3 pl-4 pr-3">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{icp.name}</p>
                          {icp.description && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[180px]">
                              {icp.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={
                              icp.is_active
                                ? 'inline-flex rounded-md border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 text-xs font-medium px-2 py-1'
                                : 'inline-flex rounded-md border border-border bg-muted/50 text-muted-foreground text-xs font-medium px-2 py-1'
                            }
                          >
                            {icp.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-muted-foreground">
                          {icp.filters.institution_type && (
                            <span className="mr-2">Type: {icp.filters.institution_type}</span>
                          )}
                          {icp.filters.staff_role_contains && (
                            <span className="mr-2">Role: {icp.filters.staff_role_contains}</span>
                          )}
                          {icp.filters.min_confidence_score != null && (
                            <span className="mr-2">Conf: {icp.filters.min_confidence_score}</span>
                          )}
                          {icp.filters.enrichment_status && (
                            <span>Status: {icp.filters.enrichment_status}</span>
                          )}
                          {!icp.filters.institution_type &&
                            !icp.filters.staff_role_contains &&
                            icp.filters.min_confidence_score == null &&
                            !icp.filters.enrichment_status && (
                              <span className="italic">—</span>
                            )}
                        </td>
                        <td className="py-3 pl-3 pr-4 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="mr-2 transition-all duration-150 ease-out"
                            onClick={() => startEdit(icp)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="transition-all duration-150 ease-out"
                            onClick={() => deleteMutation.mutate(icp.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ——— RIGHT PANEL: NEW / EDIT FORM ——— */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-6">
              {editing ? `Edit ICP: ${editing.name}` : 'New ICP'}
            </h2>

            {/* SECTION 1 — Basic Info */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Basic info
            </p>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="icp-name">
                  Name
                </label>
                <Input
                  id="icp-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="transition-[color,box-shadow] duration-150"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="icp-desc">
                  Description
                </label>
                <Textarea
                  id="icp-desc"
                  className="min-h-[80px] transition-[color,box-shadow] duration-150"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">Active</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Inactive ICPs will not be used in outreach generation.
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input h-6 w-11 [&>span]:size-5"
                />
              </div>
            </div>

            {/* SECTION 2 — Targeting Filters */}
            <div className="border-t border-border/60 pt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Targeting filters
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    htmlFor="icp-institution"
                  >
                    Institution type
                  </label>
                  <Input
                    id="icp-institution"
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value)}
                    placeholder="e.g. parish, school"
                    className="transition-[color,box-shadow] duration-150"
                  />
                  <p className="text-xs text-muted-foreground">Filter by organization type.</p>
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    htmlFor="icp-role"
                  >
                    Staff role contains
                  </label>
                  <Input
                    id="icp-role"
                    value={staffRoleContains}
                    onChange={(e) => setStaffRoleContains(e.target.value)}
                    placeholder="e.g. pastor, principal"
                    className="transition-[color,box-shadow] duration-150"
                  />
                  <p className="text-xs text-muted-foreground">Match contacts whose role contains this text.</p>
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    htmlFor="icp-confidence"
                  >
                    Min confidence score
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="icp-confidence"
                      type="number"
                      min={0}
                      max={1}
                      step={0.05}
                      value={minConfidence}
                      onChange={(e) =>
                        setMinConfidence(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="0–1"
                      className="w-24 transition-[color,box-shadow] duration-150"
                    />
                    <span className="text-xs text-muted-foreground">0–1 scale</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    htmlFor="icp-enrichment"
                  >
                    Enrichment status
                  </label>
                  <Input
                    id="icp-enrichment"
                    value={enrichmentStatus}
                    onChange={(e) => setEnrichmentStatus(e.target.value)}
                    placeholder="e.g. enriched, pending, failed"
                    className="transition-[color,box-shadow] duration-150"
                  />
                </div>
              </div>
            </div>

            {/* BUTTON AREA */}
            <div className="mt-8 pt-6 border-t border-border/60 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={startCreate}
                className="transition-all duration-150 ease-out"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="default"
                onClick={onSave}
                disabled={saveMutation.isPending}
                className="transition-all duration-150 ease-out"
              >
                Save ICP
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
