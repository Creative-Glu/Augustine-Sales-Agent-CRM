'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Activity, Trophy, XCircle, Flag, Lock } from 'lucide-react';
import { useGetICPs } from '@/services/icps/useICPs';
import {
  useMarkJourneyClosed,
  type ClosedOutcome,
} from '@/services/journey/useJourneys';
import { useToastHelpers } from '@/lib/toast';
import { STAGE_COLORS } from '@/constants/journey';
import type { Journey, JourneyLead } from '@/types/Journey';
import JourneyLogsTimeline from './JourneyLogsTimeline';
import MarkJourneyClosedDialog from './MarkJourneyClosedDialog';

const CLOSED_STAGES: ReadonlySet<string> = new Set(['Closed-Won', 'Closed-Lost']);

export type JourneyViewTab = 'details' | 'logs';

interface JourneyViewModalProps {
  open: boolean;
  onClose: () => void;
  journey: Journey | null;
  initialTab?: JourneyViewTab;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
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

const LEAD_FIELD_GROUPS: { title: string; fields: (keyof JourneyLead)[] }[] = [
  {
    title: 'Contact',
    fields: ['Parish Name', 'Parish Contact Email', 'Parish Phone'],
  },
  {
    title: 'Classification',
    fields: ['Institution Type', 'Classification', 'Formed Status', 'Technology Readiness'],
  },
  {
    title: 'Location',
    fields: [
      'Diocese/Archdiocese Name',
      'Ecclesiastical Province',
      'Deanery/Vicariate',
      'Rite/Church Sui Juris',
    ],
  },
  {
    title: 'Operations',
    fields: [
      'Parish Size/School Enrollmen',
      'Religious Order Affiliation',
      'Liturgical Language(s)',
      'Budget Cycle Month',
    ],
  },
];

const LEAD_FIELD_LABELS: Partial<Record<keyof JourneyLead, string>> = {
  'Parish Size/School Enrollmen': 'Parish Size / School Enrollment',
};

function leadFieldValue(lead: JourneyLead, field: keyof JourneyLead): string {
  const v = lead[field];
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

export default function JourneyViewModal({
  open,
  onClose,
  journey,
  initialTab = 'details',
}: JourneyViewModalProps) {
  const { data: icpsData } = useGetICPs();
  const { successToast, errorToast } = useToastHelpers();
  const { mutateAsync: markClosed, isPending: isMarkingClosed } =
    useMarkJourneyClosed();

  const [pendingOutcome, setPendingOutcome] = useState<ClosedOutcome | null>(null);

  if (!journey) return null;

  const stageColor = STAGE_COLORS[journey.funnel_stage] || '#94a3b8';
  const lead = journey.lead;
  const campaign = journey.campaigns;
  const icpName = lead?.icp_id
    ? (icpsData?.find((i) => i.icp_id === lead.icp_id)?.icp_name ?? lead.icp_id)
    : null;

  const isAlreadyClosed = CLOSED_STAGES.has(journey.funnel_stage);
  const closedAsWon = journey.funnel_stage === 'Closed-Won';
  const journeyLabel = lead?.['Parish Name'] || `Lead #${journey.lead_id}`;

  const handleConfirmClosure = async (payload: {
    lostReason?: string;
    note?: string;
  }) => {
    if (!pendingOutcome) return;
    try {
      await markClosed({
        journeyId: journey.journey_id,
        outcome: pendingOutcome,
        options: {
          lostReason: payload.lostReason,
          note: payload.note,
        },
      });
      successToast(
        pendingOutcome === 'Closed-Won'
          ? `Marked "${journeyLabel}" as Closed-Won.`
          : `Marked "${journeyLabel}" as Closed-Lost.`
      );
      setPendingOutcome(null);
    } catch (err) {
      const detail = err instanceof Error ? err.message : '';
      errorToast(
        `Couldn't update journey outcome${detail ? ` — ${detail}` : ''}`
      );
      // Keep the dialog open so user can retry without retyping the note
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Journey Details</DialogTitle>
        </DialogHeader>

        <Tabs key={`${journey.journey_id}-${initialTab}`} defaultValue={initialTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Details
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Activity Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-5">
          {/* Journey identity */}
          <section className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Journey
                </p>
                <h3 className="mt-0.5 text-base font-semibold text-card-foreground truncate">
                  {lead?.['Parish Name'] || `Lead #${journey.lead_id}`}
                </h3>
              </div>
              <Badge
                className="font-semibold text-white border-0"
                style={{ backgroundColor: stageColor }}
              >
                {journey.funnel_stage}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Field label="Journey ID" value={journey.journey_id} mono />
              <Field label="Lead ID" value={String(journey.lead_id)} mono />
              <Field label="Email Thread ID" value={journey.email_thread_id ?? '—'} mono />
              <Field label="Campaign ID" value={String(journey.campaign_id)} mono />
              <Field label="Last Interaction" value={formatDateTime(journey.last_interaction)} />
              <Field label="Created" value={formatDateTime(journey.created_at)} />
              <Field label="Updated" value={formatDateTime(journey.updated_at)} />
              {icpName && <Field label="ICP" value={icpName} />}
            </div>
          </section>

          {/* ─── Mark outcome ─────────────────────────────────────── */}
          <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/60 dark:to-blue-950/40 border-b border-border">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                <Flag className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Mark Journey Outcome</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Manually close out this journey when the deal is decided
                </p>
              </div>
            </div>

            <div className="p-4">
              {isAlreadyClosed ? (
                <div
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${
                    closedAsWon
                      ? 'border-emerald-200 bg-emerald-50/60 dark:bg-emerald-500/15 dark:border-emerald-500/30'
                      : 'border-rose-200 bg-rose-50/60 dark:bg-rose-500/15 dark:border-rose-500/30'
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                      closedAsWon
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
                    }`}
                  >
                    {closedAsWon ? (
                      <Trophy className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        closedAsWon ? 'text-emerald-900 dark:text-emerald-300' : 'text-rose-900 dark:text-rose-300'
                      }`}
                    >
                      Journey is already {journey.funnel_stage}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Closed at {formatDateTime(journey.last_interaction)}. To
                      reopen, update the funnel stage directly from the journey
                      record or contact your admin.
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      <Lock className="w-2.5 h-2.5" />
                      Locked
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPendingOutcome('Closed-Won')}
                      disabled={isMarkingClosed}
                      className="group flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50/40 dark:bg-emerald-500/15 dark:border-emerald-500/30 hover:bg-emerald-100/70 hover:border-emerald-400 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed px-3 py-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300 group-hover:bg-emerald-200 transition-colors shrink-0">
                          <Trophy className="w-4 h-4" />
                        </span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                            Mark as Closed-Won
                          </p>
                          <p className="text-[10px] text-emerald-800/80 dark:text-emerald-400">
                            Deal won · stops outreach
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPendingOutcome('Closed-Lost')}
                      disabled={isMarkingClosed}
                      className="group flex items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50/40 dark:bg-rose-500/15 dark:border-rose-500/30 hover:bg-rose-100/70 hover:border-rose-400 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed px-3 py-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300 group-hover:bg-rose-200 transition-colors shrink-0">
                          <XCircle className="w-4 h-4" />
                        </span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-rose-900 dark:text-rose-300">
                            Mark as Closed-Lost
                          </p>
                          <p className="text-[10px] text-rose-800/80 dark:text-rose-400">
                            Deal lost · stops outreach
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Current stage:{' '}
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
                      style={{ backgroundColor: stageColor }}
                    >
                      {journey.funnel_stage}
                    </span>{' '}
                    · You&apos;ll be asked to confirm and add an optional note
                    before the change is saved.
                  </p>
                </>
              )}
            </div>
          </section>

          {/* Notes */}
          <section>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
              Notes
            </p>
            <div className="rounded-lg border border-border bg-muted/30 p-3 max-h-[180px] overflow-y-auto">
              <p className="text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">
                {journey.notes?.trim() || 'No notes recorded for this journey.'}
              </p>
            </div>
          </section>

          {/* Lead details */}
          <section className="rounded-xl border border-border bg-card p-4 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Lead Details
            </p>
            {lead ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                {LEAD_FIELD_GROUPS.map((group) => (
                  <div key={group.title}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                      {group.title}
                    </p>
                    <dl className="space-y-1.5">
                      {group.fields.map((field) => (
                        <div
                          key={String(field)}
                          className="grid grid-cols-[140px_1fr] gap-2 text-sm"
                        >
                          <dt className="text-muted-foreground truncate">
                            {LEAD_FIELD_LABELS[field] ?? String(field)}
                          </dt>
                          <dd className="text-card-foreground break-words">
                            {leadFieldValue(lead, field)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No lead data available.</p>
            )}
          </section>

          {/* Campaign details */}
          <section className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Campaign
              </p>
              {campaign?.campaign_status && (
                <Badge variant="secondary">{campaign.campaign_status}</Badge>
              )}
            </div>

            {campaign ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Name"
                    value={campaign.campaign_name || '—'}
                    className="col-span-2"
                  />
                  <Field label="Campaign ID" value={String(campaign.campaign_id)} mono />
                  <Field label="Offer ID" value={campaign.offer_id ?? '—'} mono />
                  <Field
                    label="Created"
                    value={campaign.createdat ? formatDateTime(campaign.createdat) : '—'}
                    className="col-span-2"
                  />
                </div>

                <div className="pt-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                    Instructions
                  </p>
                  <div className="rounded-lg border border-border bg-muted/30 p-3 max-h-[160px] overflow-y-auto">
                    <p className="text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">
                      {campaign.instructions?.trim() || 'No instructions set.'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No campaign data available.</p>
            )}
          </section>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <JourneyLogsTimeline journeyId={journey.journey_id} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t border-border mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 bg-card border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>

      {/* Outcome confirmation dialog — rendered alongside the parent Dialog
          so its overlay doesn't clip behind it. */}
      <MarkJourneyClosedDialog
        open={!!pendingOutcome}
        onOpenChange={(open) => {
          if (!open && !isMarkingClosed) setPendingOutcome(null);
        }}
        outcome={pendingOutcome}
        journeyLabel={journeyLabel}
        onConfirm={handleConfirmClosure}
        loading={isMarkingClosed}
      />
    </Dialog>
  );
}

interface FieldProps {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}

function Field({ label, value, mono, className }: FieldProps) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={`mt-0.5 text-sm text-card-foreground break-words ${
          mono ? 'font-mono text-[12px]' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}
