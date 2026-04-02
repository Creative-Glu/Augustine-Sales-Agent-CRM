'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Inbox, RefreshCw, ChevronDown, ChevronRight, Info, Send, Check, X } from 'lucide-react';
import { OUTREACH_TABS, type OutreachTabKey } from '@/constants/outreach';

function getStatusesForTab(tab: OutreachTabKey): string {
  if (tab === 'pending') return 'generated,under_review,edited';
  if (tab === 'approved_unsent') return 'approved';
  if (tab === 'sent') return 'sent';
  if (tab === 'rejected') return 'rejected';
  return '';
}

function isReviewerOrAdmin(role: 'Admin' | 'Reviewer' | 'Viewer'): boolean {
  return role === 'Reviewer' || role === 'Admin';
}

function statusGroup(status: OutreachStatus): 'pending' | 'approved' | 'sent' | 'rejected' {
  if (status === 'generated' || status === 'under_review' || status === 'edited') return 'pending';
  if (status === 'approved') return 'approved';
  if (status === 'sent') return 'sent';
  return 'rejected';
}

function StatusBadge({ status }: { status: OutreachStatus }) {
  const group = statusGroup(status);
  const labels: Record<OutreachStatus, string> = {
    generated: 'Generated',
    under_review: 'Under review',
    edited: 'Edited',
    approved: 'Approved',
    rejected: 'Rejected',
    sent: 'Sent',
  };
  const label = labels[status];
  const base = 'inline-flex rounded-md text-xs font-medium px-2 py-1';
  const styles: Record<typeof group, string> = {
    pending:
      'border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
    approved:
      'border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
    sent: 'border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300',
    rejected:
      'border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300',
  };
  return <span className={`${base} ${styles[group]}`}>{label}</span>;
}

export default function OutreachPage() {
  const [activeTab, setActiveTab] = useState<OutreachTabKey>('pending');
  const [selected, setSelected] = useState<OutreachItem | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [bulkLimit, setBulkLimit] = useState(100);
  const [campaignGenerateCampaignId, setCampaignGenerateCampaignId] = useState<number | ''>('');
  const [campaignGenerateLimit, setCampaignGenerateLimit] = useState(50);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
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

  const activeCampaigns = (campaignsQuery.data ?? []).filter((c) => c.status === 'active');

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveOutreach(id, 'Ops Reviewer'),
    onSuccess: () => {
      toast({ title: 'Approved', description: 'Message approved successfully.' });
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
    },
    onError: (err: unknown) => {
      toast({
        title: 'Unable to approve',
        description: err instanceof Error ? err.message : 'Check your permissions or try again later.',
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
    onError: (err: unknown) => {
      toast({
        title: 'Unable to reject',
        description: err instanceof Error ? err.message : 'Check your permissions or try again later.',
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
    onError: (err: unknown) => {
      toast({
        title: 'Unable to send',
        description: err instanceof Error ? err.message : 'Check approval status or daily limits.',
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
    onError: (err: unknown) => {
      toast({
        title: 'Unable to save edits',
        description: err instanceof Error ? err.message : 'Try again or contact an admin.',
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
    onError: (err: unknown) => {
      toast({
        title: 'Unable to bulk generate',
        description:
          err instanceof Error ? err.message : 'If you see a 429 error, reduce the limit or try again later.',
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
    onError: (err: unknown) => {
      toast({
        title: 'Unable to generate for campaign',
        description:
          err instanceof Error
            ? err.message
            : 'Campaign must be active and have an ICP linked. Check Campaigns or try again.',
        variant: 'destructive',
      });
    },
  });

  const activeItems =
    activeTab === 'pending' ? pendingQuery.data?.items ?? [] : tabQuery.data?.items ?? [];
  const totalCount = activeItems.length;
  const isLoading = activeTab === 'pending' ? pendingQuery.isLoading : tabQuery.isLoading;
  const isError = activeTab === 'pending' ? pendingQuery.isError : tabQuery.isError;

  function openDetail(item: OutreachItem) {
    setSelected(item);
    setEditSubject(item.subject ?? '');
    setEditBody(item.body ?? '');
    setRejectionReason('');
  }

  function refetchAll() {
    pendingQuery.refetch();
    tabQuery.refetch();
  }

  const disableActions = !canAct;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950">
      <Header
        title="Outreach Approval"
        subtitle="Review and control AI-generated outreach before sending."
        icon={<Inbox className="w-6 h-6 text-white" />}
        showLive
      />

      <div className="border-b border-border/60 bg-background/50" />

      <div className="px-6 py-8 space-y-6">
        {/* ——— SEGMENTED STATUS TABS ——— */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            className="inline-flex rounded-lg border border-border bg-muted/30 p-1 gap-0.5"
          >
            {OUTREACH_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium
                    transition-all duration-150 ease-out
                    ${isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }
                  `}
                >
                  {tab.label}
                  {isActive && (
                    <span className="min-w-5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-semibold">
                      {totalCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ——— TWO COLUMN: QUEUE (60%) | DETAIL (40%) ——— */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-6 items-start">
          {/* LEFT: Message Queue */}
          <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {activeTab === 'pending' ? 'Pending review queue' : 'Outreach messages'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {disableActions
                    ? 'Viewer mode. Switch to Reviewer/Admin to approve or send.'
                    : 'Select a row to review and approve, reject, or send.'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={refetchAll}
                disabled={isLoading}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors duration-150"
                aria-label="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="py-3 pl-6 pr-3 font-medium text-muted-foreground text-xs">
                      Subject
                    </TableHead>
                    <TableHead className="py-3 px-3 font-medium text-muted-foreground text-xs w-[100px]">
                      Campaign
                    </TableHead>
                    <TableHead className="py-3 px-3 font-medium text-muted-foreground text-xs w-[90px]">
                      Status
                    </TableHead>
                    <TableHead className="py-3 px-3 font-medium text-muted-foreground text-xs w-[120px]">
                      Generated
                    </TableHead>
                    <TableHead className="py-3 pl-3 pr-6 text-right font-medium text-muted-foreground text-xs w-[100px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <>
                      {[1, 2, 3, 4].map((i) => (
                        <TableRow key={i} className="border-border/40">
                          <TableCell className="py-3 pl-6 pr-3">
                            <div className="h-4 w-3/4 rounded bg-muted/60 animate-pulse" />
                            <div className="h-3 w-full rounded bg-muted/40 animate-pulse mt-2" />
                          </TableCell>
                          <TableCell className="py-3 px-3">
                            <div className="h-4 w-8 rounded bg-muted/50 animate-pulse" />
                          </TableCell>
                          <TableCell className="py-3 px-3">
                            <div className="h-5 w-16 rounded bg-muted/50 animate-pulse" />
                          </TableCell>
                          <TableCell className="py-3 px-3">
                            <div className="h-4 w-20 rounded bg-muted/50 animate-pulse" />
                          </TableCell>
                          <TableCell className="py-3 pl-3 pr-6">
                            <div className="h-8 w-14 rounded bg-muted/50 animate-pulse ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                  {isError && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                        Failed to load. Try again.
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && !isError && activeItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                        No messages in this tab.
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading &&
                    !isError &&
                    activeItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className={`
                          border-border/40 cursor-pointer transition-colors duration-150
                          ${selected?.id === item.id
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/30'
                            : 'hover:bg-muted/40'
                          }
                        `}
                        onClick={() => openDetail(item)}
                      >
                        <TableCell className="py-3 pl-6 pr-3 max-w-0">
                          <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                            {item.subject || '(no subject)'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {item.body}
                          </p>
                        </TableCell>
                        <TableCell className="py-3 px-3 text-xs text-muted-foreground">
                          {item.campaign_id ? `#${item.campaign_id}` : '—'}
                        </TableCell>
                        <TableCell className="py-3 px-3">
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell className="py-3 px-3 text-xs text-muted-foreground">
                          {item.generated_at
                            ? new Date(item.generated_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </TableCell>
                        <TableCell className="py-3 pl-3 pr-6 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={disableActions}
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(item);
                            }}
                            className="transition-all duration-150"
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* RIGHT: Message Detail Panel */}
          <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col min-h-[420px]">
            <div className="px-6 py-4 border-b border-border/60">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Message detail
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Edit subject and body, then approve, reject, or send.
              </p>
            </div>

            {!selected ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground text-center">
                  Select a message from the queue to review and take action.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Subject
                      </label>
                      <Input
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        disabled={disableActions}
                        className="transition-[color,box-shadow] duration-150"
                      />
                    </div>
                    <div className="border-t border-border/60 pt-4" />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Body
                      </label>
                      <Textarea
                        className="min-h-[200px] resize-none transition-[color,box-shadow] duration-150"
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        disabled={disableActions}
                      />
                    </div>
                  </div>

                  {/* Sticky action bar */}
                  <div className="mt-auto border-t border-border/60 bg-muted/20 px-6 py-4 space-y-4">
                    <div className="flex flex-wrap gap-2">
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
                        className="transition-all duration-150"
                      >
                        Save edits
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-150"
                        disabled={disableActions || approveMutation.isPending}
                        onClick={() => approveMutation.mutate(selected.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30 transition-all duration-150"
                        disabled={disableActions || rejectMutation.isPending}
                        onClick={() =>
                          rejectMutation.mutate({
                            id: selected.id,
                            reason: rejectionReason,
                          })
                        }
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      {selected.status === 'approved' && (
                        <Button
                          type="button"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white transition-all duration-150"
                          disabled={disableActions || sendMutation.isPending}
                          onClick={() => sendMutation.mutate(selected.id)}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Send
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      <label className="text-xs font-medium text-muted-foreground">
                        Rejection reason (optional)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          disabled={disableActions}
                          placeholder="Reason for rejection"
                          className="flex-1 text-sm transition-[color,box-shadow] duration-150"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        {/* ——— COLLAPSIBLE: Generate New Drafts ——— */}
        <Collapsible open={generateOpen} onOpenChange={setGenerateOpen}>
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors duration-150"
              >
                <div className="flex items-center gap-2">
                  {generateOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Generate New Drafts
                  </span>
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 pt-0 space-y-6 border-t border-border/60">
                {/* Mode A: Quick Generate */}
                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2 min-w-[140px]">
                    <label className="text-xs font-medium text-muted-foreground">Quick generate</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={500}
                        className="w-20 h-9"
                        value={bulkLimit}
                        onChange={(e) => setBulkLimit(Number(e.target.value) || 1)}
                      />
                      <Button
                        size="sm"
                        disabled={bulkGenerateMutation.isPending}
                        onClick={() => {
                          const safe = Math.min(500, Math.max(1, bulkLimit || 1));
                          setBulkLimit(safe);
                          bulkGenerateMutation.mutate(safe);
                        }}
                        className="transition-all duration-150"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    New drafts go to Default campaign (1–500).
                  </p>
                </div>

                {/* Mode B: Generate for Campaign */}
                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Campaign</label>
                    <Select
                      value={campaignGenerateCampaignId === '' ? '' : String(campaignGenerateCampaignId)}
                      onValueChange={(v) => setCampaignGenerateCampaignId(v === '' ? '' : Number(v))}
                    >
                      <SelectTrigger className="w-[220px] h-9">
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
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Limit</label>
                    <Input
                      type="number"
                      min={1}
                      max={500}
                      className="w-20 h-9"
                      value={campaignGenerateLimit}
                      onChange={(e) =>
                        setCampaignGenerateLimit(
                          Math.min(500, Math.max(1, Number(e.target.value) || 1))
                        )
                      }
                    />
                  </div>
                  <Button
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
                    className="transition-all duration-150"
                  >
                    Generate for campaign
                  </Button>
                </div>
                {activeCampaigns.length === 0 && !campaignsQuery.isLoading && (
                  <p className="text-xs text-muted-foreground">
                    No active campaigns. Set a campaign to active in Campaigns to use it.
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* ——— COLLAPSIBLE: How campaign assignment works ——— */}
        <Collapsible open={infoOpen} onOpenChange={setInfoOpen}>
          <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors duration-150"
              >
                <div className="flex items-center gap-2">
                  {infoOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-muted-foreground">
                    How campaign assignment works
                  </span>
                  <span onClick={(e) => e.stopPropagation()}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex text-muted-foreground hover:text-foreground cursor-help">
                          <Info className="w-4 h-4" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[260px]">
                        Bulk generate assigns drafts to the Default campaign. Use &quot;Generate for
                        campaign&quot; to target a specific active campaign with an ICP.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 pt-0 text-xs text-muted-foreground space-y-2 border-t border-border/40">
                <p>
                  <strong className="text-foreground/80">Bulk generate</strong> does not let you
                  choose a campaign: all new drafts are assigned to the <strong className="text-foreground/80">Default</strong> campaign
                  (often Campaign #1).
                </p>
                <p>
                  To create drafts for a specific campaign (e.g. Institution Campaign), use{' '}
                  <strong className="text-foreground/80">Generate for campaign</strong>. The campaign
                  must be <strong className="text-foreground/80">active</strong> and have an ICP
                  linked.
                </p>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </div>
  );
}
