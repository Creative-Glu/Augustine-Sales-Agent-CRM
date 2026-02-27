'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  listCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStatsById,
} from '@/services/augustine/campaigns.service';
import type { Campaign, CampaignStatus } from '@/types/augustine';
import { listIcps } from '@/services/augustine/icp.service';

const STATUS_OPTIONS: CampaignStatus[] = ['draft', 'active', 'paused', 'completed'];

export default function MarketingCampaignsPage() {
  const { toast } = useToast();
  const [editing, setEditing] = useState<Campaign | null>(null);
  const campaignsQuery = useQuery({
    queryKey: ['augustine', 'campaigns', 'list'],
    queryFn: listCampaigns,
  });
  const icpsQuery = useQuery({
    queryKey: ['augustine', 'icp', 'list'],
    queryFn: listIcps,
  });

  const [name, setName] = useState('');
  const [icpId, setIcpId] = useState<string>('none');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [tone, setTone] = useState('');
  const [status, setStatus] = useState<CampaignStatus>('draft');
  const [dailyLimit, setDailyLimit] = useState<number | ''>('');

  const startCreate = () => {
    setEditing(null);
    setName('');
    setIcpId('');
    setSubject('');
    setBody('');
    setTone('');
    setStatus('draft');
    setDailyLimit('');
  };

  const startEdit = (c: Campaign) => {
    setEditing(c);
    setName(c.name);
    setIcpId(c.icp_id ? String(c.icp_id) : '');
    setSubject(c.template_subject);
    setBody(c.template_body);
    setTone(c.tone ?? '');
    setStatus(c.status);
    setDailyLimit(c.daily_send_limit ?? '');
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      id?: Campaign['id'];
      icp_id: string | null;
      name: string;
      subject: string;
      body: string;
      tone?: string | null;
      status: CampaignStatus;
      daily_send_limit?: number | null;
    }) => {
      const base = {
        icp_id: payload.icp_id,
        name: payload.name,
        template_subject: payload.subject,
        template_body: payload.body,
        tone: payload.tone,
        status: payload.status,
        daily_send_limit: payload.daily_send_limit,
      };
      if (payload.id != null) {
        return updateCampaign(payload.id, base);
      }
      return createCampaign(base);
    },
    onSuccess: () => {
      toast({ title: 'Campaign saved', description: 'Changes saved to backend.' });
      campaignsQuery.refetch();
      setEditing(null);
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to save campaign',
        description: err?.message ?? 'Check API and try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: Campaign['id']) => deleteCampaign(id),
    onSuccess: () => {
      toast({ title: 'Campaign deleted' });
      campaignsQuery.refetch();
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to delete campaign',
        description: err?.message ?? 'Try again later.',
        variant: 'destructive',
      });
    },
  });

  const onSave = () => {
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Give this campaign a clear, marketing-friendly name.',
        variant: 'destructive',
      });
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast({
        title: 'Template required',
        description: 'Subject and body are required to generate outreach.',
        variant: 'destructive',
      });
      return;
    }
    const normalizedIcpId = icpId === 'none' ? null : icpId;

    saveMutation.mutate({
      id: editing?.id,
      icp_id: normalizedIcpId,
      name,
      subject,
      body,
      tone: tone || null,
      status,
      daily_send_limit: dailyLimit === '' ? null : Number(dailyLimit),
    });
  };

  const campaigns = campaignsQuery.data ?? [];
  const icps = icpsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        title="Campaign management"
        subtitle="Manage campaigns, templates, tone, and send limits for outreach."
        icon={<span className="text-white text-lg font-semibold">CM</span>}
        showLive
      />

      <div className="px-6 py-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.3fr)] gap-6 items-start">
        <section className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Campaigns</h2>
            <Button type="button" size="sm" onClick={startCreate}>
              New campaign
            </Button>
          </div>
          <div className="border border-border/60 rounded-lg max-h-[360px] overflow-y-auto bg-muted/40">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/70 border-b border-border/60">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">ICP</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Daily limit</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Generated / approved / sent
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaignsQuery.isLoading && (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">
                      Loading campaigns…
                    </td>
                  </tr>
                )}
                {!campaignsQuery.isLoading && campaigns.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">
                      No campaigns yet. Create one on the right.
                    </td>
                  </tr>
                )}
                {!campaignsQuery.isLoading &&
                  campaigns.map((c) => {
                    const icpLabel =
                      c.icp_id && icps.length
                        ? icps.find((i) => String(i.id) === String(c.icp_id))?.name ??
                          `ICP #${c.icp_id}`
                        : '—';
                    return (
                      <tr key={c.id} className="border-b border-border/40">
                        <td className="px-3 py-2">
                          <p className="font-medium">{c.name}</p>
                          {c.tone && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              Tone: {c.tone}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-muted-foreground">{icpLabel}</td>
                        <td className="px-3 py-2 text-[11px] capitalize">{c.status}</td>
                        <td className="px-3 py-2 tabular-nums text-[11px]">
                          {c.daily_send_limit ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-[11px] tabular-nums">—</td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            className="mr-1"
                            onClick={() => startEdit(c)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            onClick={() => deleteMutation.mutate(c.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-semibold">
            {editing ? `Edit campaign: ${editing.name}` : 'New campaign'}
          </h2>

          <div className="space-y-2 text-xs">
            <label className="block text-muted-foreground mb-1">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-muted-foreground mb-1">ICP</label>
            <Select value={icpId} onValueChange={setIcpId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select ICP (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {icps.map((i) => (
                  <SelectItem key={i.id} value={String(i.id)}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-muted-foreground mb-1">Tone</label>
            <Input
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g. warm, pastoral, concise"
            />
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-muted-foreground mb-1">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as CampaignStatus)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-muted-foreground mb-1">Daily send limit</label>
            <Input
              type="number"
              min={0}
              value={dailyLimit}
              onChange={(e) =>
                setDailyLimit(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-muted-foreground mb-1">Template subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-muted-foreground mb-1">Template body</label>
            <Textarea
              className="min-h-[160px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
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
              Save campaign
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

