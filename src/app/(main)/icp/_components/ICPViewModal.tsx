'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTimeShort } from '@/utils/format';
import { useICPDetails } from '@/services/icps/useICPs';
import type { ICP } from '@/types/icps';
import {
  Target,
  Tag,
  Calendar,
  Package,
  Users,
  AlertCircle,
  Inbox,
  FileText,
  Mail,
  Phone,
  Building2,
  MapPin,
} from 'lucide-react';

interface ICPViewModalProps {
  open: boolean;
  onClose: () => void;
  icp: ICP | null;
}

export default function ICPViewModal({ open, onClose, icp }: ICPViewModalProps) {
  const { data, isLoading, isError, refetch } = useICPDetails(icp?.icp_id ?? null);

  if (!icp) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-linear-to-br from-amber-500 to-orange-500 text-white shadow-sm">
              <Target className="w-4 h-4" />
            </span>
            ICP Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* ─── ICP header card ────────────────────────────────── */}
          <section className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="bg-linear-to-br from-amber-50 via-orange-50/40 to-yellow-50/40 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-yellow-950/40 px-5 py-4 border-b border-border relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
              <div className="pl-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ideal Customer Profile
                </p>
                <h3 className="mt-0.5 text-base font-bold text-slate-900 truncate dark:text-slate-100">
                  {icp.icp_name || '—'}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <Stat
                icon={<Tag className="w-4 h-4" />}
                label="ICP ID"
                value={icp.icp_id}
                tint="indigo"
                mono
              />
              <Stat
                icon={<Calendar className="w-4 h-4" />}
                label="Created"
                value={icp.created_at ? formatDateTimeShort(icp.created_at) : '—'}
                tint="emerald"
              />
            </div>

            {icp.icp_desc && (
              <div className="px-5 py-3 border-t border-border bg-muted/50">
                <div className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0 dark:text-slate-500" />
                  <p className="text-[12px] text-slate-700 leading-relaxed dark:text-slate-200">
                    {icp.icp_desc}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* ─── Linked Product Offers ──────────────────────────── */}
          <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-50 to-blue-50/30 dark:from-emerald-950/40 dark:to-blue-950/40 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Package className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Linked Product Offers</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Offers that target this ICP
                  </p>
                </div>
              </div>
              {!isLoading && !isError && data && (
                <Badge
                  className={`tabular-nums shadow-sm ${
                    data.offers.length > 0
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                      : 'bg-muted text-slate-600 border border-border dark:text-slate-400'
                  }`}
                >
                  {data.offers.length} {data.offers.length === 1 ? 'offer' : 'offers'}
                </Badge>
              )}
            </div>

            <div className="p-3">
              {isLoading && <SkeletonRows rows={2} />}
              {!isLoading && isError && (
                <ErrorBox onRetry={() => refetch()}>
                  Failed to load linked offers
                </ErrorBox>
              )}
              {!isLoading && !isError && data && data.offers.length === 0 && (
                <EmptyBox
                  icon={<Inbox className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
                  title="No offers yet"
                  description="No product offers currently target this ICP. Create one from the Offers page."
                />
              )}
              {!isLoading && !isError && data && data.offers.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <Th>Offer</Th>
                        <Th>ID</Th>
                        <Th>Bundled Products</Th>
                        <Th className="w-32">Created</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.offers.map((offer) => {
                        const products = [
                          offer.offer_1_product?.product_name,
                          offer.offer_2_product?.product_name,
                          offer.offer_3_product?.product_name,
                        ];
                        const filled = products.filter(Boolean).length;
                        return (
                          <tr
                            key={offer.offer_id}
                            className="border-b border-border last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-2 px-3">
                              <p
                                className="text-sm font-semibold text-slate-900 truncate max-w-50 dark:text-slate-100"
                                title={offer.offer_name}
                              >
                                {offer.offer_name}
                              </p>
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap dark:text-slate-400">
                              {offer.offer_id}
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex flex-wrap items-center gap-1">
                                {products.map((name, i) => {
                                  const tint =
                                    i === 0
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                                      : i === 1
                                        ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30'
                                        : 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30';
                                  if (!name) {
                                    return (
                                      <span
                                        key={i}
                                        className="inline-flex items-center rounded border border-dashed border-slate-300 px-1.5 py-0.5 text-[10px] text-slate-400 dark:text-slate-500 italic"
                                      >
                                        Slot {i + 1}
                                      </span>
                                    );
                                  }
                                  return (
                                    <span
                                      key={i}
                                      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium truncate max-w-40 ${tint}`}
                                      title={name}
                                    >
                                      {name}
                                    </span>
                                  );
                                })}
                              </div>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                {filled}/3 slots filled
                              </p>
                            </td>
                            <td className="py-2 px-3 text-[11px] text-slate-500 tabular-nums whitespace-nowrap dark:text-slate-400">
                              {offer.created_at
                                ? formatDateTimeShort(offer.created_at)
                                : '—'}
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

          {/* ─── Linked Contacts (leads matching this ICP) ──────── */}
          <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50/30 dark:from-blue-950/40 dark:to-indigo-950/40 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                  <Users className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Matching Contacts / Leads
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Parishes and institutions tagged with this ICP
                  </p>
                </div>
              </div>
              {!isLoading && !isError && data && (
                <Badge
                  className={`tabular-nums shadow-sm ${
                    data.contactsTotal > 0
                      ? 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30'
                      : 'bg-muted text-slate-600 border border-border dark:text-slate-400'
                  }`}
                >
                  {data.contactsTotal} total
                </Badge>
              )}
            </div>

            <div className="p-3">
              {isLoading && <SkeletonRows rows={3} />}
              {!isLoading && isError && (
                <ErrorBox onRetry={() => refetch()}>
                  Failed to load contacts
                </ErrorBox>
              )}
              {!isLoading && !isError && data && data.contacts.length === 0 && (
                <EmptyBox
                  icon={<Inbox className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
                  title="No contacts matched"
                  description="No leads are currently tagged with this ICP."
                />
              )}
              {!isLoading && !isError && data && data.contacts.length > 0 && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <Th>Parish / Lead</Th>
                          <Th>Contact</Th>
                          <Th className="w-32">Institution</Th>
                          <Th className="w-32">Diocese</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.contacts.map((c) => (
                          <tr
                            key={c.id}
                            className="border-b border-border last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-2 px-3 min-w-0">
                              <p
                                className="text-sm font-semibold text-slate-900 truncate max-w-50 dark:text-slate-100"
                                title={c['Parish Name'] ?? `Lead #${c.id}`}
                              >
                                {c['Parish Name'] || `Lead #${c.id}`}
                              </p>
                              {c.Classification && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {c.Classification}
                                </p>
                              )}
                            </td>
                            <td className="py-2 px-3 min-w-0">
                              {c['Parish Contact Email'] && (
                                <p
                                  className="text-[11px] text-slate-700 flex items-center gap-1 truncate max-w-50 dark:text-slate-200"
                                  title={c['Parish Contact Email']}
                                >
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0 dark:text-slate-500" />
                                  {c['Parish Contact Email']}
                                </p>
                              )}
                              {c['Parish Phone'] && (
                                <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 dark:text-slate-400">
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0 dark:text-slate-500" />
                                  {c['Parish Phone']}
                                </p>
                              )}
                              {!c['Parish Contact Email'] && !c['Parish Phone'] && (
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                                  No contact info
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              {c['Institution Type'] ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30">
                                  <Building2 className="w-3 h-3" />
                                  {c['Institution Type']}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 dark:text-slate-500">—</span>
                              )}
                            </td>
                            <td className="py-2 px-3 min-w-0">
                              {c['Diocese/Archdiocese Name'] ? (
                                <p
                                  className="text-[11px] text-slate-700 flex items-center gap-1 truncate max-w-40 dark:text-slate-200"
                                  title={c['Diocese/Archdiocese Name']}
                                >
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0 dark:text-slate-500" />
                                  {c['Diocese/Archdiocese Name']}
                                </p>
                              ) : (
                                <span className="text-[11px] text-slate-400 dark:text-slate-500">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {data.contactsTotal > data.contacts.length && (
                    <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 italic text-center">
                      Showing first {data.contacts.length} of {data.contactsTotal}{' '}
                      contacts — open the Contacts page to see all.
                    </p>
                  )}
                </>
              )}
            </div>
          </section>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-card border border-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
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
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-300' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-300' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-300' },
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
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm font-bold text-slate-900 truncate dark:text-slate-100 ${
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
      className={`text-left py-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${
        className ?? ''
      }`}
    >
      {children}
    </th>
  );
}

function SkeletonRows({ rows }: { rows: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
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
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-center dark:bg-rose-500/15 dark:border-rose-500/30">
      <AlertCircle className="w-4 h-4 text-rose-600 mx-auto mb-1 dark:text-rose-400" />
      <p className="text-[12px] font-medium text-rose-800 dark:text-rose-400">{children}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 text-[11px] font-medium text-rose-700 hover:text-rose-900 underline dark:text-rose-400"
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
    <div className="rounded-lg border border-dashed border-slate-300 bg-muted/50 px-4 py-6 text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-2">
        {icon}
      </div>
      <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p
        className="text-[11px] text-slate-500 mt-0.5 mx-auto leading-relaxed dark:text-slate-400"
        style={{ maxWidth: '20rem' }}
      >
        {description}
      </p>
    </div>
  );
}
