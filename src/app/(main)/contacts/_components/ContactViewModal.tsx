'use client';

import { Contact, useContactDetails } from '@/services/contacts/useContacts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTimeShort } from '@/utils/format';
import { STAGE_COLORS } from '@/constants/journey';
import {
  UserCircle2,
  Mail,
  Phone,
  Building2,
  MapPin,
  Target,
  TreePine,
  Inbox,
  AlertCircle,
  Calendar,
  Tag,
  FileText,
  Wallet,
  Sparkles,
} from 'lucide-react';

interface ContactViewModalProps {
  open: boolean;
  onClose: () => void;
  contact: Contact | null;
}

const ATTR_GROUPS: {
  title: string;
  icon: React.ReactNode;
  accentBg: string;
  accentIcon: string;
  fields: { key: keyof Contact; label: string }[];
}[] = [
  {
    title: 'Classification',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    accentBg: 'from-violet-50 to-violet-50/30',
    accentIcon: 'bg-violet-100 text-violet-600',
    fields: [
      { key: 'Institution Type', label: 'Institution Type' },
      { key: 'Classification', label: 'Classification' },
      { key: 'Formed Status', label: 'Formed Status' },
      { key: 'Technology Readiness', label: 'Tech Readiness' },
    ],
  },
  {
    title: 'Location',
    icon: <MapPin className="w-3.5 h-3.5" />,
    accentBg: 'from-blue-50 to-blue-50/30',
    accentIcon: 'bg-blue-100 text-blue-600',
    fields: [
      { key: 'Diocese/Archdiocese Name', label: 'Diocese' },
      { key: 'Ecclesiastical Province', label: 'Province' },
      { key: 'Deanery/Vicariate', label: 'Deanery' },
      { key: 'Rite/Church Sui Juris', label: 'Rite' },
    ],
  },
  {
    title: 'Operations',
    icon: <Wallet className="w-3.5 h-3.5" />,
    accentBg: 'from-emerald-50 to-emerald-50/30',
    accentIcon: 'bg-emerald-100 text-emerald-600',
    fields: [
      { key: 'Parish Size/School Enrollmen', label: 'Parish Size' },
      { key: 'Religious Order Affiliation', label: 'Religious Order' },
      { key: 'Liturgical Language(s)', label: 'Languages' },
      { key: 'Budget Cycle Month', label: 'Budget Cycle' },
    ],
  },
];

export default function ContactViewModal({ open, onClose, contact }: ContactViewModalProps) {
  const { data, isLoading, isError, refetch } = useContactDetails(contact?.id ?? null);

  if (!contact) return null;

  // Prefer freshly-fetched details when available, otherwise fall back to the
  // row data passed in from the table so the header doesn't flash empty while
  // the details query is loading.
  const fullContact: Contact = data?.contact ?? contact;
  const icp = data?.icp ?? null;
  const journeys = data?.journeys ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
              <UserCircle2 className="w-4 h-4" />
            </span>
            Contact Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* ─── Contact header card ────────────────────────────── */}
          <section className="rounded-xl border border-slate-200 bg-card overflow-hidden shadow-sm">
            <div className="bg-linear-to-br from-blue-50 via-indigo-50/60 to-violet-50/40 px-5 py-4 border-b border-slate-200 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
              <div className="pl-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Contact
                </p>
                <h3 className="mt-0.5 text-base font-bold text-slate-900 truncate">
                  {fullContact['Parish Name'] || `Lead #${fullContact.id}`}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px]">
                  {fullContact['Parish Contact Email'] && (
                    <span className="flex items-center gap-1 text-slate-700">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-60">
                        {fullContact['Parish Contact Email']}
                      </span>
                    </span>
                  )}
                  {fullContact['Parish Phone'] && (
                    <span className="flex items-center gap-1 text-slate-700">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {fullContact['Parish Phone']}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <Stat
                icon={<Tag className="w-4 h-4" />}
                label="Lead ID"
                value={String(fullContact.id)}
                tint="indigo"
                mono
              />
              <Stat
                icon={<Building2 className="w-4 h-4" />}
                label="Institution"
                value={fullContact['Institution Type'] || '—'}
                tint="amber"
              />
              <Stat
                icon={<Calendar className="w-4 h-4" />}
                label="Created"
                value={
                  fullContact.created_at
                    ? formatDateTimeShort(fullContact.created_at)
                    : '—'
                }
                tint="emerald"
              />
            </div>
          </section>

          {/* ─── Matching ICP card ──────────────────────────────── */}
          <section className="rounded-xl border border-slate-200 bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-linear-to-r from-amber-50 to-amber-50/30 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-100 text-amber-600">
                  <Target className="w-3.5 h-3.5" />
                </span>
                <p className="text-xs font-bold text-slate-900">Matching ICP</p>
              </div>
              {isLoading && (
                <span className="text-[10px] text-slate-500">Loading…</span>
              )}
            </div>
            <div className="p-4">
              {isLoading && <Skeleton className="h-10 w-full rounded-md" />}
              {!isLoading && isError && (
                <ErrorBox onRetry={() => refetch()}>
                  Failed to load ICP details
                </ErrorBox>
              )}
              {!isLoading && !isError && !icp && !fullContact.icp_id && (
                <EmptyBox
                  icon={<Inbox className="w-5 h-5 text-slate-400" />}
                  title="No ICP linked"
                  description="This contact isn't tagged with an Ideal Customer Profile yet."
                />
              )}
              {!isLoading && !isError && !icp && fullContact.icp_id && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-600">
                  ICP linked:{' '}
                  <span className="font-mono text-slate-800">{fullContact.icp_id}</span>{' '}
                  <span className="text-slate-400">(details unavailable)</span>
                </div>
              )}
              {!isLoading && !isError && icp && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/40 px-3 py-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-amber-900 truncate">
                        {icp.icp_name}
                      </p>
                      {icp.icp_desc && (
                        <p className="mt-0.5 text-[11px] text-amber-900/80 leading-relaxed line-clamp-2">
                          {icp.icp_desc}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-amber-700 bg-amber-100 border border-amber-200 rounded px-1.5 py-0.5 shrink-0">
                      {icp.icp_id}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ─── Linked Journeys (campaigns this lead is in) ────── */}
          <section className="rounded-xl border border-slate-200 bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-50 to-blue-50/30 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-600">
                  <TreePine className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Campaign Journeys</p>
                  <p className="text-[10px] text-slate-500">
                    Every campaign this contact is in
                  </p>
                </div>
              </div>
              {!isLoading && !isError && (
                <Badge
                  className={`tabular-nums shadow-sm ${
                    journeys.length > 0
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {journeys.length} {journeys.length === 1 ? 'journey' : 'journeys'}
                </Badge>
              )}
            </div>

            <div className="p-3">
              {isLoading && (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              )}
              {!isLoading && isError && (
                <ErrorBox onRetry={() => refetch()}>
                  Failed to load journeys
                </ErrorBox>
              )}
              {!isLoading && !isError && journeys.length === 0 && (
                <EmptyBox
                  icon={<Inbox className="w-5 h-5 text-slate-400" />}
                  title="Not in any campaign yet"
                  description="This contact has no journey records — they haven't been added to a campaign."
                />
              )}
              {!isLoading && !isError && journeys.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-100">
                        <Th>Campaign</Th>
                        <Th className="w-28 text-center">Stage</Th>
                        <Th className="w-36">Last Interaction</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {journeys.map((j) => {
                        const color = STAGE_COLORS[j.funnel_stage] || '#94a3b8';
                        return (
                          <tr
                            key={j.journey_id}
                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="py-2 px-3 min-w-0">
                              <p
                                className="text-sm font-semibold text-slate-900 truncate max-w-65"
                                title={
                                  j.campaigns?.campaign_name ?? `Campaign #${j.campaign_id}`
                                }
                              >
                                {j.campaigns?.campaign_name ??
                                  `Campaign #${j.campaign_id}`}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {j.campaigns?.campaign_status ?? '—'}
                              </p>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
                                style={{ backgroundColor: color }}
                              >
                                <span className="w-1 h-1 rounded-full bg-white/90" />
                                {j.funnel_stage}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-[11px] text-slate-600 tabular-nums whitespace-nowrap">
                              {formatDateTimeShort(j.last_interaction)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* ─── Lead Attributes (3 grouped sections) ───────────── */}
          {ATTR_GROUPS.map((group) => {
            const hasAnyValue = group.fields.some((f) => !!fullContact[f.key]);
            return (
              <section
                key={group.title}
                className="rounded-xl border border-slate-200 bg-card shadow-sm overflow-hidden"
              >
                <div
                  className={`flex items-center gap-2 px-4 py-2.5 bg-linear-to-r ${group.accentBg} border-b border-slate-200`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${group.accentIcon}`}
                  >
                    {group.icon}
                  </span>
                  <p className="text-xs font-bold text-slate-900">{group.title}</p>
                </div>
                <div className="p-3">
                  {hasAnyValue ? (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      {group.fields.map((field) => (
                        <div key={String(field.key)} className="flex items-baseline gap-2">
                          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 w-28 shrink-0">
                            {field.label}
                          </dt>
                          <dd className="text-[12px] text-slate-800 truncate">
                            {(fullContact[field.key] as string) || (
                              <span className="text-slate-400">—</span>
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic text-center py-2">
                      No {group.title.toLowerCase()} data recorded.
                    </p>
                  )}
                </div>
              </section>
            );
          })}

          {/* ─── Email thread ───────────────────────────────────── */}
          {fullContact['Email Thread'] && (
            <section className="rounded-xl border border-slate-200 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-600">
                  <FileText className="w-3.5 h-3.5" />
                </span>
                <p className="text-xs font-bold text-slate-900">Email Thread</p>
              </div>
              <div className="p-4">
                <div
                  className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 overflow-y-auto"
                  style={{ maxHeight: '12rem' }}
                >
                  <pre className="whitespace-pre-wrap wrap-break-word font-sans text-[12px] leading-relaxed text-slate-700">
                    {fullContact['Email Thread']}
                  </pre>
                </div>
              </div>
            </section>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────── */

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: 'emerald' | 'indigo' | 'amber';
  mono?: boolean;
}

function Stat({ icon, label, value, tint, mono }: StatProps) {
  const tintMap: Record<StatProps['tint'], { bg: string; text: string }> = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  };
  const t = tintMap[tint];
  return (
    <div className="px-4 py-3 flex items-start gap-3">
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${t.bg} ${t.text} shrink-0`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm font-bold text-slate-900 truncate ${
            mono ? 'font-mono text-xs' : ''
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`text-left py-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ${
        className ?? ''
      }`}
    >
      {children}
    </th>
  );
}

function ErrorBox({
  children,
  onRetry,
}: {
  children: React.ReactNode;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-center">
      <AlertCircle className="w-4 h-4 text-rose-600 mx-auto mb-1" />
      <p className="text-[12px] font-medium text-rose-800">{children}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 text-[11px] font-medium text-rose-700 hover:text-rose-900 underline"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyBox({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 mb-2">
        {icon}
      </div>
      <p className="text-[12px] font-semibold text-slate-700">{title}</p>
      <p
        className="text-[11px] text-slate-500 mt-0.5 mx-auto leading-relaxed"
        style={{ maxWidth: '20rem' }}
      >
        {description}
      </p>
    </div>
  );
}
