'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useGetICPs } from '@/services/icps/useICPs';
import { STAGE_COLORS } from '@/constants/journey';
import type { Journey, JourneyLead } from '@/types/Journey';

interface JourneyViewModalProps {
  open: boolean;
  onClose: () => void;
  journey: Journey | null;
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

export default function JourneyViewModal({ open, onClose, journey }: JourneyViewModalProps) {
  const { data: icpsData } = useGetICPs();

  if (!journey) return null;

  const stageColor = STAGE_COLORS[journey.funnel_stage] || '#94a3b8';
  const lead = journey.lead;
  const campaign = journey.campaigns;
  const icpName = lead?.icp_id
    ? (icpsData?.find((i) => i.icp_id === lead.icp_id)?.icp_name ?? lead.icp_id)
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Journey Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
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

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
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
