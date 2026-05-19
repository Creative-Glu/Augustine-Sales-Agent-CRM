'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToastHelpers } from '@/lib/toast';
import {
  useGetCompaign,
  useDeleteCompaign,
  useUpdateCampaignStatus,
} from '@/services/campaign/useCampaign';
import type { Campaign } from '@/types/compaign';
import { Info, Megaphone, Plus } from 'lucide-react';
import { CAMPAIGN_STATUS_OPTIONS, CAMPAIGN_COLUMNS } from '@/constants';
import { TableHeader } from '@/components/TableHeader';
import { EditButton, DeleteButton } from '@/components/ActionButtons';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import CampaignModal from './_components/CampaignModal';

type CampaignStatus = (typeof CAMPAIGN_STATUS_OPTIONS)[number];

function statusBadgeClass(status: string): string {
  const base = 'inline-flex rounded-md text-xs font-medium px-2 py-1';
  switch (status) {
    case 'Running':
      return `${base} border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300`;
    case 'Active':
      return `${base} border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300`;
    case 'Draft':
      return `${base} border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300`;
    case 'Stopped':
      return `${base} border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300`;
    default:
      return `${base} border border-border bg-muted/50 text-muted-foreground`;
  }
}

export default function CampaignsPage() {
  const { successToast, errorToast } = useToastHelpers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [statusChange, setStatusChange] = useState<{
    campaign: Campaign;
    newStatus: CampaignStatus;
  } | null>(null);

  const { data, isLoading, refetch } = useGetCompaign();
  const { mutateAsync: deleteCampaign, isPending: isDeleting } = useDeleteCompaign();
  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } = useUpdateCampaignStatus();

  const campaigns: Campaign[] = data ?? [];

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (c: Campaign) => {
    setEditing(c);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCampaign(deleteTarget.campaign_id);
      successToast('Campaign deleted successfully!');
    } catch {
      errorToast('Failed to delete campaign');
    }
    setDeleteTarget(null);
  };

  const handleConfirmStatus = async () => {
    if (!statusChange) return;
    try {
      await updateStatus({
        campaignId: statusChange.campaign.campaign_id,
        newStatus: statusChange.newStatus,
      });
      successToast('Status updated successfully!');
    } catch {
      errorToast('Failed to update status');
    }
    setStatusChange(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <Header
        title="Campaign Management"
        subtitle="Manage campaigns, templates, tone, and send limits for outreach."
        icon={<Megaphone className="w-6 h-6 text-white" />}
        showLive
      />

      <div className="px-6 py-8">
        <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Campaigns
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'}
              </p>
            </div>
            <Button
              className="cursor-pointer hover:scale-110 "
              type="button"
              size="sm"
              onClick={openCreate}
            >
              <Plus className="w-4 h-4" />
              New campaign
            </Button>
          </div>

          <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 px-4 py-3">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              <p className="font-medium mb-0.5">How campaign status works</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-800 dark:text-blue-300">
                <li>
                  Setting status to <span className="font-semibold">Active</span> queues the
                  campaign — it will{' '}
                  <span className="font-semibold">auto-run within ~10 minutes</span>.
                </li>
                <li>
                  Status flips to <span className="font-semibold">Running</span> automatically once
                  the first email outreach is dropped.
                </li>
              </ul>
            </div>
          </div>

          <div className="border border-border/60 rounded-xl overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <TableHeader columns={CAMPAIGN_COLUMNS} />
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        Loading campaigns…
                      </td>
                    </tr>
                  )}

                  {!isLoading && campaigns.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-10">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="rounded-full bg-muted/60 p-3 mb-3">
                            <Megaphone className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            No campaigns yet
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
                            Create a campaign to define templates and send limits for outreach.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    campaigns.map((c) => {
                      const offerLabel = c.offer?.offer_name ?? c.offer_id ?? '—';
                      const createdLabel = c.createdat
                        ? new Date(c.createdat).toLocaleDateString()
                        : '—';
                      return (
                        <tr
                          key={c.campaign_id}
                          className="border-b border-border/40 last:border-0 hover:bg-muted/40 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {c.campaign_name}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{offerLabel}</td>
                          <td className="py-3 px-4">
                            <Select
                              value={c.campaign_status}
                              onValueChange={(v) => {
                                if (v === c.campaign_status) return;
                                setStatusChange({
                                  campaign: c,
                                  newStatus: v as CampaignStatus,
                                });
                              }}
                            >
                              <SelectTrigger
                                className="h-8 w-[130px] text-xs"
                                aria-label={`Change status for ${c.campaign_name}`}
                              >
                                <SelectValue>
                                  <span className={statusBadgeClass(c.campaign_status)}>
                                    {c.campaign_status}
                                  </span>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {CAMPAIGN_STATUS_OPTIONS.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground tabular-nums">
                            {createdLabel}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            <p className="truncate max-w-[260px]" title={c.instructions ?? ''}>
                              {c.instructions || '—'}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <EditButton onClick={() => openEdit(c)} />
                              <DeleteButton onDelete={() => setDeleteTarget(c)} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <CampaignModal
        open={modalOpen}
        onClose={handleCloseModal}
        onCreated={refetch}
        campaign={editing}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete campaign"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.campaign_name}"? This cannot be undone.`
            : 'Delete this campaign?'
        }
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />

      <AlertDialog
        open={!!statusChange}
        onOpenChange={(o) => !o && !isUpdatingStatus && setStatusChange(null)}
      >
        <AlertDialogContent className="sm:max-w-[425px] rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Change campaign status?</AlertDialogTitle>
            <AlertDialogDescription>
              {statusChange ? (
                <>
                  Update <span className="font-medium">{statusChange.campaign.campaign_name}</span>{' '}
                  from <span className="font-medium">{statusChange.campaign.campaign_status}</span>{' '}
                  to <span className="font-medium">{statusChange.newStatus}</span>?
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingStatus}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isUpdatingStatus} onClick={handleConfirmStatus}>
              {isUpdatingStatus ? 'Updating…' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
