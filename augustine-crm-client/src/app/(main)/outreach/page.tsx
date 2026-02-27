'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  listPendingOutreach,
  listOutreach,
  approveOutreach,
  rejectOutreach,
  sendOutreach,
  editOutreach,
  bulkGenerateOutreach,
  generateOutreachForCampaign,
} from '@/services/augustine/outreach.service';
import { listCampaigns } from '@/services/augustine/campaigns.service';
import type { OutreachItem, OutreachStatus } from '@/types/augustine';
import { useAuth } from '@/providers/AuthProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TabKey = 'pending' | 'approved_unsent' | 'sent' | 'rejected';

function getStatusesForTab(tab: TabKey): string {
  if (tab === 'pending') return 'generated,under_review,edited';
  if (tab === 'approved_unsent') return 'approved';
  if (tab === 'sent') return 'sent';
  if (tab === 'rejected') return 'rejected';
  return '';
}

function isReviewerOrAdmin(role: 'Admin' | 'Reviewer' | 'Viewer'): boolean {
  return role === 'Reviewer' || role === 'Admin';
}

function StatusBadge({ status }: { status: OutreachStatus }) {
  const map: Record<OutreachStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }>= {
    generated: { label: 'Generated', variant: 'secondary' },
    under_review: { label: 'Under review', variant: 'secondary' },
    edited: { label: 'Edited', variant: 'secondary' },
    approved: { label: 'Approved', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'outline' },
    sent: { label: 'Sent', variant: 'default' },
  };
  const cfg = map[status];
  return (
    <Badge variant={cfg.variant} className="text-[11px]">
      {cfg.label}
    </Badge>
  );
}

export default function OutreachPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [selected, setSelected] = useState<OutreachItem | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [bulkLimit, setBulkLimit] = useState(100);
  const [campaignGenerateCampaignId, setCampaignGenerateCampaignId] = useState<
    number | ''
  >('');
  const [campaignGenerateLimit, setCampaignGenerateLimit] = useState(50);
  const { user } = useAuth();
  const role = user?.role ?? 'Viewer';
  const canAct = isReviewerOrAdmin(role);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const pendingQuery = useQuery({
    queryKey: ['outreach', 'pending'],
    queryFn: () => listPendingOutreach(50),
    staleTime: 10_000,
  });

  const tabQuery = useQuery({
    queryKey: ['outreach', 'tab', activeTab],
    queryFn: () => {
      const statuses = getStatusesForTab(activeTab);
      return listOutreach({ limit: 100, statuses });
    },
    enabled: activeTab !== 'pending',
    staleTime: 10_000,
  });

  const campaignsQuery = useQuery({
    queryKey: ['augustine', 'campaigns', 'list'],
    queryFn: listCampaigns,
    staleTime: 30_000,
  });

  const activeCampaigns = (campaignsQuery.data ?? []).filter(
    (c) => c.status === 'active'
  );

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveOutreach(id, 'Ops Reviewer'),
    onSuccess: () => {
      toast({ title: 'Approved', description: 'Message approved successfully.' });
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to approve',
        description: err?.message ?? 'Check your permissions or try again later.',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (payload: { id: number; reason: string }) =>
      rejectOutreach(payload.id, payload.reason),
    onSuccess: () => {
      toast({ title: 'Rejected', description: 'Message rejected.' });
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to reject',
        description: err?.message ?? 'Check your permissions or try again later.',
        variant: 'destructive',
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: number) => sendOutreach(id),
    onSuccess: () => {
      toast({ title: 'Sent', description: 'Message sent (backend will handle delivery).' });
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to send',
        description: err?.message ?? 'Check approval status or daily limits.',
        variant: 'destructive',
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: (payload: { id: number; subject: string; body: string }) =>
      editOutreach(payload.id, { subject: payload.subject, body: payload.body }),
    onSuccess: () => {
      toast({ title: 'Saved', description: 'Draft updated.' });
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to save edits',
        description: err?.message ?? 'Try again or contact an admin.',
        variant: 'destructive',
      });
    },
  });

  const bulkGenerateMutation = useMutation({
    mutationFn: (limit: number) => bulkGenerateOutreach({ limit }),
    onSuccess: (res) => {
      toast({
        title: 'Bulk generation requested',
        description: `Generated: ${res.generated}, skipped: ${res.skipped}, errors: ${res.errors}`,
      });
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to bulk generate',
        description:
          err?.message ??
          'If you see a 429 error, reduce the limit or try again later.',
        variant: 'destructive',
      });
    },
  });

  const generateForCampaignMutation = useMutation({
    mutationFn: (payload: { campaign_id: number; limit: number }) =>
      generateOutreachForCampaign(payload),
    onSuccess: (res) => {
      toast({
        title: 'Campaign generation completed',
        description: `Generated: ${res.generated}, skipped: ${res.skipped}, errors: ${res.errors}`,
      });
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to generate for campaign',
        description:
          err?.message ??
          'Campaign must be active and have an ICP linked. Check Campaigns or try again.',
        variant: 'destructive',
      });
    },
  });

  const activeItems =
    activeTab === 'pending'
      ? pendingQuery.data?.items ?? []
      : tabQuery.data?.items ?? [];

  const totalCount = activeItems.length;

  const isLoading =
    activeTab === 'pending' ? pendingQuery.isLoading : tabQuery.isLoading;
  const isError =
    activeTab === 'pending' ? pendingQuery.isError : tabQuery.isError;

  function openDetail(item: OutreachItem) {
    setSelected(item);
    setEditSubject(item.subject ?? '');
    setEditBody(item.body ?? '');
    setRejectionReason('');
  }

  const disableActions = !canAct;

  return (
    <div className="max-w-6xl mx-auto">
      <Header
        title="Outreach approval"
        subtitle="Review AI-generated drafts, approve or reject, and send when ready."
        icon={<span className="text-white text-lg font-semibold">AI</span>}
        showLive
      />

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)] gap-6 items-start">
        <div className="space-y-4">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabKey)}
            className="w-full"
          >
            <TabsList className="w-full justify-start overflow-x-auto rounded-xl bg-muted/60 p-1.5">
              <TabsTrigger
                value="pending"
                className="px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="approved_unsent"
                className="px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Approved (unsent)
              </TabsTrigger>
              <TabsTrigger
                value="sent"
                className="px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Sent
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Rejected
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border/60">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {activeTab === 'pending'
                        ? 'Pending review queue'
                        : 'Outreach messages'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {disableActions
                        ? 'You are in Viewer mode. Switch to Reviewer/Admin to approve or send.'
                        : 'Only Reviewer/Admin can edit, approve, reject, or send.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      Showing {totalCount} {totalCount === 1 ? 'message' : 'messages'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        pendingQuery.refetch();
                        tabQuery.refetch();
                      }}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table className="min-w-[820px] w-full table-fixed text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/2">Subject</TableHead>
                        <TableHead className="w-1/6">Campaign</TableHead>
                        <TableHead className="w-1/6">Status</TableHead>
                        <TableHead className="w-1/6">Generated</TableHead>
                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm py-6">
                            Loading outreach messages…
                          </TableCell>
                        </TableRow>
                      )}
                      {isError && !isLoading && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm py-6">
                            Failed to load outreach. Please try again.
                          </TableCell>
                        </TableRow>
                      )}
                      {!isLoading && !isError && activeItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm py-6">
                            No outreach messages in this bucket yet.
                          </TableCell>
                        </TableRow>
                      )}
                      {!isLoading &&
                        !isError &&
                        activeItems.map((item) => (
                          <TableRow
                            key={item.id}
                            className={selected?.id === item.id ? 'bg-muted/70' : ''}
                          >
                            <TableCell className="max-w-[320px]">
                              <button
                                type="button"
                                className="text-left text-[13px] font-medium text-foreground hover:text-primary hover:underline truncate block"
                                onClick={() => openDetail(item)}
                              >
                                {item.subject || '(no subject)'}
                              </button>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {item.body}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {item.campaign_id ? `Campaign #${item.campaign_id}` : '—'}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={item.status} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {item.generated_at
                                ? new Date(item.generated_at).toLocaleString()
                                : '—'}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  disabled={disableActions}
                                  onClick={() => openDetail(item)}
                                >
                                  Review
                                </Button>
                                {canAct && activeTab === 'pending' && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="default"
                                    disabled={approveMutation.isPending}
                                    onClick={() => approveMutation.mutate(item.id)}
                                  >
                                    Approve
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
            <p className="font-medium">How drafts get their campaign</p>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-300/90">
              <strong>Bulk generate</strong> does not let you choose a campaign: all new drafts are
              assigned to the <strong>Default</strong> campaign (often Campaign #1). To create drafts
              for a specific campaign (e.g. Institution Campaign), use <strong>Generate for
              campaign</strong> below — the campaign must be <strong>active</strong> and have an
              ICP linked.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Bulk generate outreach</p>
                <p className="text-xs text-muted-foreground">
                  New drafts go to the Default campaign (limit 1–500).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={500}
                  className="w-20 h-8"
                  value={bulkLimit}
                  onChange={(e) => setBulkLimit(Number(e.target.value) || 1)}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={bulkGenerateMutation.isPending}
                  onClick={() => {
                    const safe = Math.min(500, Math.max(1, bulkLimit || 1));
                    setBulkLimit(safe);
                    bulkGenerateMutation.mutate(safe);
                  }}
                >
                  Generate
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              If you hit a 429 rate or cost limit, reduce the limit or try again later.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-3">
            <div>
              <p className="text-sm font-medium">Generate for campaign</p>
              <p className="text-xs text-muted-foreground">
                Create drafts for one campaign only. Campaign must be active and have an ICP.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Campaign</label>
                <Select
                  value={campaignGenerateCampaignId === '' ? '' : String(campaignGenerateCampaignId)}
                  onValueChange={(v) => setCampaignGenerateCampaignId(v === '' ? '' : Number(v))}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select active campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCampaigns.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} (#{c.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Limit</label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  className="w-20 h-9"
                  value={campaignGenerateLimit}
                  onChange={(e) =>
                    setCampaignGenerateLimit(Math.min(500, Math.max(1, Number(e.target.value) || 1)))
                  }
                />
              </div>
              <Button
                type="button"
                size="sm"
                disabled={
                  campaignGenerateCampaignId === '' ||
                  activeCampaigns.length === 0 ||
                  generateForCampaignMutation.isPending
                }
                onClick={() => {
                  if (campaignGenerateCampaignId === '') return;
                  const limit = Math.min(500, Math.max(1, campaignGenerateLimit || 1));
                  setCampaignGenerateLimit(limit);
                  generateForCampaignMutation.mutate({
                    campaign_id: campaignGenerateCampaignId,
                    limit,
                  });
                }}
              >
                Generate for campaign
              </Button>
            </div>
            {(activeCampaigns.length === 0 && !campaignsQuery.isLoading) ||
            (campaignsQuery.data && campaignsQuery.data.some((c) => c.status !== 'active')) ? (
              <p className="text-xs text-muted-foreground">
                {activeCampaigns.length === 0 && !campaignsQuery.isLoading
                  ? 'No active campaigns. Set a campaign to active in Campaigns to use it.'
                  : 'Only active campaigns appear here. Set a campaign to active in Campaigns to use it.'}
              </p>
            ) : null}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-4">
          <div>
            <p className="text-sm font-medium">Message detail</p>
            <p className="text-xs text-muted-foreground">
              Full body with inline editing for subject and content.
            </p>
          </div>

          {!selected && (
            <p className="text-sm text-muted-foreground">
              Select a message from the table to review its content and approve, reject, or send.
            </p>
          )}

          {selected && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Subject</label>
                <Input
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  disabled={disableActions}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Body</label>
                <Textarea
                  className="min-h-[220px]"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  disabled={disableActions}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={disableActions || editMutation.isPending}
                  onClick={() =>
                    editMutation.mutate({
                      id: selected.id,
                      subject: editSubject,
                      body: editBody,
                    })
                  }
                >
                  Save edits
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  disabled={disableActions || approveMutation.isPending}
                  onClick={() => approveMutation.mutate(selected.id)}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={
                    disableActions ||
                    sendMutation.isPending ||
                    selected.status !== 'approved'
                  }
                  onClick={() => sendMutation.mutate(selected.id)}
                >
                  Send
                </Button>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/60">
                <label className="text-xs font-medium text-muted-foreground">
                  Rejection reason (optional)
                </label>
                <Textarea
                  className="min-h-[80px]"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={disableActions}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={disableActions || rejectMutation.isPending}
                  onClick={() =>
                    rejectMutation.mutate({
                      id: selected.id,
                      reason: rejectionReason,
                    })
                  }
                >
                  Reject
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

