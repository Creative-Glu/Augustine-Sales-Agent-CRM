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

export default function MarketingIcpPage() {
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
    onError: (err: any) => {
      toast({
        title: 'Unable to save ICP',
        description: err?.message ?? 'Check API and try again.',
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
    onError: (err: any) => {
      toast({
        title: 'Unable to delete ICP',
        description: err?.message ?? 'Try again later.',
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        title="ICP management"
        subtitle="Define and edit Ideal Customer Profiles used for outreach generation."
        icon={<span className="text-white text-lg font-semibold">IC</span>}
        showLive
      />

      <div className="px-6 py-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1.4fr)] gap-6 items-start">
        <section className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">ICPs</h2>
            <Button type="button" size="sm" onClick={startCreate}>
              New ICP
            </Button>
          </div>
          <div className="border border-border/60 rounded-lg max-h-[360px] overflow-y-auto bg-muted/40">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/70 border-b border-border/60">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Active</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Filters</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {icpsQuery.isLoading && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                      Loading ICPs…
                    </td>
                  </tr>
                )}
                {!icpsQuery.isLoading && icps.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                      No ICPs yet. Create one on the right.
                    </td>
                  </tr>
                )}
                {!icpsQuery.isLoading &&
                  icps.map((icp) => (
                    <tr key={icp.id} className="border-b border-border/40">
                      <td className="px-3 py-2">
                        <p className="font-medium">{icp.name}</p>
                        {icp.description && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {icp.description}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium">
                          {icp.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-muted-foreground">
                        {icp.filters.institution_type && (
                          <span className="mr-2">Type: {icp.filters.institution_type}</span>
                        )}
                        {icp.filters.staff_role_contains && (
                          <span className="mr-2">Role contains: {icp.filters.staff_role_contains}</span>
                        )}
                        {icp.filters.min_confidence_score != null && (
                          <span className="mr-2">
                            Min confidence: {icp.filters.min_confidence_score}
                          </span>
                        )}
                        {icp.filters.enrichment_status && (
                          <span>Status: {icp.filters.enrichment_status}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          className="mr-1"
                          onClick={() => startEdit(icp)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
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

        <section className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-semibold">
            {editing ? `Edit ICP: ${editing.name}` : 'New ICP'}
          </h2>
          <div className="space-y-2 text-xs">
            <label className="block text-muted-foreground mb-1">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2 text-xs">
            <label className="block text-muted-foreground mb-1">Description</label>
            <Textarea
              className="min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Active</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="mt-2 space-y-2 text-xs">
            <p className="font-semibold">Filters</p>
            <div>
              <label className="block text-muted-foreground mb-1">Institution type</label>
              <Input
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value)}
                placeholder="e.g. parish, school"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Staff role contains</label>
              <Input
                value={staffRoleContains}
                onChange={(e) => setStaffRoleContains(e.target.value)}
                placeholder="e.g. pastor, principal"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Min confidence score</label>
              <Input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={minConfidence}
                onChange={(e) =>
                  setMinConfidence(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="0–1, optional"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Enrichment status</label>
              <Input
                value={enrichmentStatus}
                onChange={(e) => setEnrichmentStatus(e.target.value)}
                placeholder="e.g. enriched, pending, failed"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={startCreate}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={saveMutation.isPending}
            >
              Save ICP
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

