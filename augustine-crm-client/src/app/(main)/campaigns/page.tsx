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
} from '@/services/augustine/campaigns.service';
import type { Campaign, CampaignStatus } from '@/types/augustine';
import { listIcps } from '@/services/augustine/icp.service';
import { Megaphone, Plus } from 'lucide-react';
import { CAMPAIGN_STATUS_OPTIONS } from '@/constants';

function statusBadgeClass(status: CampaignStatus): string {
  const base = 'inline-flex rounded-md text-xs font-medium px-2 py-1';
  switch (status) {
    case 'active':
      return `${base} border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300`;
    case 'paused':
      return `${base} border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300`;
    case 'completed':
      return `${base} border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300`;
    default:
      return `${base} border border-border bg-muted/50 text-muted-foreground`;
  }
}

export default function CampaignsPage() {
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
    setIcpId('none');
    setSubject('');
    setBody('');
    setTone('');
    setStatus('draft');
    setDailyLimit('');
  };

  const startEdit = (c: Campaign) => {
    setEditing(c);
    setName(c.name);
    setIcpId(c.icp_id ? String(c.icp_id) : 'none');
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
    onError: (err: unknown) => {
      toast({
        title: 'Unable to save campaign',
        description: err instanceof Error ? err.message : 'Check API and try again.',
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
    onError: (err: unknown) => {
      toast({
        title: 'Unable to delete campaign',
        description: err instanceof Error ? err.message : 'Try again later.',
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <Header
        title="Campaign Management"
        subtitle="Manage campaigns, templates, tone, and send limits for outreach."
        icon={<Megaphone className="w-6 h-6 text-white" />}
        showLive
      />

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.3fr)] gap-6 items-start">
          {/* ——— LEFT PANEL: CAMPAIGN LIST ——— */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Campaigns</h2>
              <Button type="button" size="sm" onClick={startCreate} className="transition-all duration-150 ease-out">
                <Plus className="w-4 h-4" />
                New campaign
              </Button>
            </div>
            <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/30 max-h-[400px] overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs text-muted-foreground bg-muted/50">
                    <th className="py-3 pl-4 pr-3 text-left font-medium">Name</th>
                    <th className="py-3 px-3 text-left font-medium">ICP</th>
                    <th className="py-3 px-3 text-left font-medium">Status</th>
                    <th className="py-3 px-3 text-left font-medium">Daily limit</th>
                    <th className="py-3 px-3 text-left font-medium">Generated / sent</th>
                    <th className="py-3 pl-3 pr-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignsQuery.isLoading && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        Loading campaigns…
                      </td>
                    </tr>
                  )}
                  {!campaignsQuery.isLoading && campaigns.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="rounded-full bg-muted/60 p-3 mb-3">
                            <Megaphone className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No campaigns yet</p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                            Create a campaign to define templates and send limits for outreach.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!campaignsQuery.isLoading &&
                    campaigns.map((c) => {
                      const icpLabel =
                        c.icp_id && icps.length
                          ? icps.find((i) => String(i.id) === String(c.icp_id))?.name ?? `ICP #${c.icp_id}`
                          : '—';
                      return (
                        <tr
                          key={c.id}
                          className="border-b border-border/40 last:border-0 transition-colors duration-150 ease-out hover:bg-muted/40"
                        >
                          <td className="py-3 pl-4 pr-3">
                            <p className="font-medium text-slate-800 dark:text-slate-100">{c.name}</p>
                            {c.tone && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[160px]">
                                Tone: {c.tone}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">{icpLabel}</td>
                          <td className="py-3 px-3">
                            <span className={statusBadgeClass(c.status)}>{c.status}</span>
                          </td>
                          <td className="py-3 px-3 tabular-nums text-xs text-muted-foreground">
                            {c.daily_send_limit ?? '—'}
                          </td>
                          <td className="py-3 px-3 text-xs tabular-nums text-muted-foreground">—</td>
                          <td className="py-3 pl-3 pr-4 text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="mr-2 transition-all duration-150 ease-out"
                              onClick={() => startEdit(c)}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="transition-all duration-150 ease-out"
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

          {/* ——— RIGHT PANEL: NEW / EDIT FORM ——— */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-6">
              {editing ? `Edit campaign: ${editing.name}` : 'New campaign'}
            </h2>

            {/* SECTION 1 — Basic info */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Basic info
            </p>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  htmlFor="camp-name"
                >
                  Name
                </label>
                <Input
                  id="camp-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="transition-[color,box-shadow] duration-150"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  htmlFor="camp-icp"
                >
                  ICP
                </label>
                <Select value={icpId} onValueChange={setIcpId}>
                  <SelectTrigger id="camp-icp" className="h-9 transition-[color,box-shadow] duration-150">
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
                <p className="text-xs text-muted-foreground">Target contacts matching this profile.</p>
              </div>
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  htmlFor="camp-tone"
                >
                  Tone
                </label>
                <Input
                  id="camp-tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="e.g. warm, pastoral, concise"
                  className="transition-[color,box-shadow] duration-150"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  htmlFor="camp-status"
                >
                  Status
                </label>
                <Select value={status} onValueChange={(v) => setStatus(v as CampaignStatus)}>
                  <SelectTrigger id="camp-status" className="h-9 transition-[color,box-shadow] duration-150">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  htmlFor="camp-limit"
                >
                  Daily send limit
                </label>
                <Input
                  id="camp-limit"
                  type="number"
                  min={0}
                  value={dailyLimit}
                  onChange={(e) =>
                    setDailyLimit(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="Optional"
                  className="transition-[color,box-shadow] duration-150"
                />
                <p className="text-xs text-muted-foreground">Cap outreach sends per day for this campaign.</p>
              </div>
            </div>

            {/* SECTION 2 — Template */}
            <div className="border-t border-border/60 pt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Template
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    htmlFor="camp-subject"
                  >
                    Template subject
                  </label>
                  <Input
                    id="camp-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="transition-[color,box-shadow] duration-150"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    htmlFor="camp-body"
                  >
                    Template body
                  </label>
                  <Textarea
                    id="camp-body"
                    className="min-h-[160px] transition-[color,box-shadow] duration-150"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Subject and body are used to generate outreach.</p>
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
                Save campaign
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
