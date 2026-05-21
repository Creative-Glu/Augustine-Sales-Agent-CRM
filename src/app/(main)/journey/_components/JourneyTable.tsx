'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Info,
  Megaphone,
  Lightbulb,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ViewButton, DeleteButton, ActivityButton } from '@/components/ActionButtons';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { STAGE_COLORS } from '@/constants/journey';
import { Journey, JourneyCampaign } from '@/types/Journey';
import { useDeleteJourney } from '@/services/journey/useJourneys';
import { useToastHelpers } from '@/lib/toast';
import { LeadHoverCard } from '@/components/LeadHoverCard';
import JourneyViewModal, { type JourneyViewTab } from './JourneyViewModal';

interface JourneyTableProps {
  journeys: Journey[];
  isLoading: boolean;
  isError: boolean;
}

interface CampaignGroup {
  campaignId: number;
  campaign: JourneyCampaign | null;
  journeys: Journey[];
}

const CAMPAIGNS_PER_PAGE = 5;

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadgeClass(status?: string): string {
  const base = 'inline-flex rounded-md text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wide';
  switch (status) {
    case 'Running':
      return `${base} border border-green-200 bg-green-50 text-green-700`;
    case 'Active':
      return `${base} border border-blue-200 bg-blue-50 text-blue-700`;
    case 'Draft':
      return `${base} border border-slate-200 bg-slate-50 text-slate-700`;
    case 'Stopped':
      return `${base} border border-red-200 bg-red-50 text-red-700`;
    default:
      return `${base} border border-slate-200 bg-slate-50 text-slate-600`;
  }
}

export default function JourneyTable({ journeys, isLoading, isError }: JourneyTableProps) {
  const { successToast, errorToast } = useToastHelpers();
  const { mutateAsync: deleteJourney, isPending: isDeleting } = useDeleteJourney();

  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  const [view, setView] = useState<{ journey: Journey; tab: JourneyViewTab } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Journey | null>(null);

  // Group journeys by campaign_id; sort each group's journeys by last_interaction desc
  const groups = useMemo<CampaignGroup[]>(() => {
    const map = new Map<number, CampaignGroup>();
    journeys.forEach((j) => {
      const key = j.campaign_id;
      if (!map.has(key)) {
        map.set(key, { campaignId: key, campaign: j.campaigns, journeys: [] });
      }
      map.get(key)!.journeys.push(j);
    });

    return Array.from(map.values())
      .map((g) => ({
        ...g,
        journeys: [...g.journeys].sort(
          (a, b) =>
            new Date(b.last_interaction).getTime() - new Date(a.last_interaction).getTime()
        ),
      }))
      .sort((a, b) => {
        const aLatest = a.journeys[0]?.last_interaction ?? '';
        const bLatest = b.journeys[0]?.last_interaction ?? '';
        return new Date(bLatest).getTime() - new Date(aLatest).getTime();
      });
  }, [journeys]);

  const totalPages = Math.max(1, Math.ceil(groups.length / CAMPAIGNS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * CAMPAIGNS_PER_PAGE;
  const pageGroups = groups.slice(pageStart, pageStart + CAMPAIGNS_PER_PAGE);

  const toggleExpand = (campaignId: number) => {
    setExpanded((prev) => ({ ...prev, [campaignId]: !prev[campaignId] }));
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteJourney(deleteTarget.journey_id);
      successToast('Journey deleted successfully');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete journey';
      errorToast(message);
    }
    setDeleteTarget(null);
  };

  // ─── Loading state ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200/60 p-6">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────────
  if (isError) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-rose-200 p-8 text-center">
        <p className="text-sm text-rose-600 font-medium">
          Failed to load journeys. Please try again.
        </p>
      </div>
    );
  }

  // ─── Empty state ────────────────────────────────────────────
  if (groups.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200/60 p-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
          <Megaphone className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-700">No journeys yet</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Journeys appear here as soon as a campaign sends its first outreach. Try
          adjusting the filters above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200/60 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Journeys by Campaign</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {groups.length} {groups.length === 1 ? 'campaign' : 'campaigns'} ·{' '}
              {journeys.length} {journeys.length === 1 ? 'journey' : 'journeys'} total
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setExpanded(Object.fromEntries(groups.map((g) => [g.campaignId, true])))
              }
              className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              Expand all
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => setExpanded({})}
              className="text-xs font-medium text-slate-600 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
            >
              Collapse all
            </button>
          </div>
        </div>

        {/* Hint banner */}
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <p className="font-semibold mb-0.5">How this view works</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-800/90">
              <li>
                Journeys are grouped by campaign so you see every lead a single campaign
                touched in one place.
              </li>
              <li>
                Click a campaign header to expand and inspect its individual journey
                rows.
              </li>
              <li>
                Use the <span className="font-medium">trash icon</span> to remove
                stale/duplicate journey records — the lead and campaign are untouched.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Campaign cards */}
      <div className="space-y-3">
        {pageGroups.map((group) => {
          const isOpen = expanded[group.campaignId] ?? false;
          const campaignName =
            group.campaign?.campaign_name ?? `Campaign #${group.campaignId}`;
          const stagesPresent = Array.from(
            new Set(group.journeys.map((j) => j.funnel_stage))
          );

          return (
            <div
              key={group.campaignId}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Campaign header (clickable to toggle) */}
              <button
                type="button"
                onClick={() => toggleExpand(group.campaignId)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 truncate">
                        {campaignName}
                      </h4>
                      <span className={statusBadgeClass(group.campaign?.campaign_status)}>
                        {group.campaign?.campaign_status ?? 'Unknown'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {group.campaign?.instructions?.slice(0, 100) || 'No instructions.'}
                      {(group.campaign?.instructions?.length ?? 0) > 100 ? '…' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    {stagesPresent.slice(0, 4).map((stage) => (
                      <span
                        key={stage}
                        title={stage}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: STAGE_COLORS[stage] ?? '#94a3b8' }}
                      />
                    ))}
                  </div>
                  <Badge variant="secondary" className="tabular-nums">
                    {group.journeys.length}{' '}
                    {group.journeys.length === 1 ? 'journey' : 'journeys'}
                  </Badge>
                </div>
              </button>

              {/* Journeys inside campaign */}
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/30">
                  {/* Sub-hint */}
                  <div className="px-5 py-2 border-b border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                    <Info className="w-3 h-3 shrink-0" />
                    <span>
                      Showing {group.journeys.length} journey
                      {group.journeys.length === 1 ? '' : 's'} for this campaign — sorted
                      by latest interaction.
                    </span>
                  </div>

                  {/* Column headers */}
                  <div className="hidden md:grid grid-cols-[minmax(0,1fr)_140px_180px_120px] gap-4 items-center px-5 py-2 border-b border-slate-100 bg-slate-100/50">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Lead
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-center">
                      Stage
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">
                      Last Interaction
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">
                      Actions
                    </span>
                  </div>

                  <ul className="divide-y divide-slate-100">
                    <AnimatePresence initial={false}>
                    {group.journeys.map((j) => {
                      const stageColor = STAGE_COLORS[j.funnel_stage] || '#94a3b8';
                      const parishName = j.lead?.['Parish Name'] || `Lead #${j.lead_id}`;
                      const email = j.lead?.['Parish Contact Email'];
                      const phone = j.lead?.['Parish Phone'];

                      return (
                        <motion.li
                          key={j.journey_id}
                          layout
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 24, height: 0, paddingTop: 0, paddingBottom: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_140px_180px_120px] gap-3 md:gap-4 items-center px-5 py-3 hover:bg-white transition-colors overflow-hidden"
                        >
                          {/* Lead info */}
                          <div className="min-w-0">
                            <LeadHoverCard lead={j.lead}>
                              <p className="text-sm font-semibold text-slate-900 truncate hover:text-blue-700 transition-colors">
                                {parishName}
                              </p>
                            </LeadHoverCard>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-0.5">
                              {email && (
                                <span className="inline-flex items-center gap-1 min-w-0 max-w-full">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{email}</span>
                                </span>
                              )}
                              {phone && (
                                <span className="inline-flex items-center gap-1 shrink-0">
                                  <Phone className="w-3 h-3" />
                                  {phone}
                                </span>
                              )}
                              {!email && !phone && (
                                <span className="text-slate-400 italic">
                                  No contact info
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stage badge — centered in its column */}
                          <div className="flex justify-start md:justify-center">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm"
                              style={{ backgroundColor: stageColor }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                              {j.funnel_stage}
                            </span>
                          </div>

                          {/* Last interaction — right aligned */}
                          <div className="text-[11px] text-slate-600 tabular-nums text-left md:text-right">
                            <span className="md:hidden text-slate-400 mr-1">
                              Last interaction:
                            </span>
                            {formatDate(j.last_interaction)}
                          </div>

                          {/* Actions — right aligned */}
                          <div className="flex items-center justify-start md:justify-end gap-2">
                            <ViewButton onClick={() => setView({ journey: j, tab: 'details' })} />
                            <ActivityButton onClick={() => setView({ journey: j, tab: 'logs' })} />
                            <DeleteButton onDelete={() => setDeleteTarget(j)} />
                          </div>
                        </motion.li>
                      );
                    })}
                    </AnimatePresence>
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination over campaigns */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3">
          <p className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-700">{safePage}</span> of{' '}
            {totalPages} · Showing campaigns {pageStart + 1}–
            {Math.min(pageStart + CAMPAIGNS_PER_PAGE, groups.length)} of {groups.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs font-medium px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="text-xs font-medium px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <JourneyViewModal
        open={!!view}
        onClose={() => setView(null)}
        journey={view?.journey ?? null}
        initialTab={view?.tab ?? 'details'}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && !isDeleting && setDeleteTarget(null)}
        title="Delete journey"
        description={
          deleteTarget
            ? `Delete the journey for "${
                deleteTarget.lead?.['Parish Name'] ?? `Lead #${deleteTarget.lead_id}`
              }" in campaign #${deleteTarget.campaign_id}? The lead and campaign are not affected.`
            : 'Delete this journey?'
        }
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
