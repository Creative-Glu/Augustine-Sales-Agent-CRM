'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDateTimeShort, formatPrice } from '@/utils/format';
import { pricingTypeConfig } from '@/constants/pricing-types';
import {
  Package,
  Tag,
  Calendar,
  Target,
  Star,
  Zap,
  Sparkles,
  Users,
  Info,
} from 'lucide-react';

interface ProductInSlot {
  product_id: string;
  product_name: string;
  product_description?: string | null;
  pricing_type?: string | null;
  price?: number | string | null;
}

interface IcpInfo {
  icp_id: string;
  icp_name: string;
  icp_desc?: string | null;
  created_at?: string | null;
}

export interface DetailedProductOffer {
  offer_id: string;
  offer_name: string;
  icp_id?: string | null;
  created_at?: string | null;
  offer_1?: string | null;
  offer_2?: string | null;
  offer_3?: string | null;
  icp?: IcpInfo | null;
  offer_1_product?: ProductInSlot | null;
  offer_2_product?: ProductInSlot | null;
  offer_3_product?: ProductInSlot | null;
}

interface ProductOfferViewModalProps {
  open: boolean;
  onClose: () => void;
  offer: DetailedProductOffer | null;
}

const SLOT_META = [
  {
    key: 1,
    label: 'Primary',
    icon: <Star className="w-3 h-3" />,
    accentBar: 'bg-emerald-500',
    pillBg: 'bg-emerald-100 dark:bg-emerald-500/15',
    pillText: 'text-emerald-800 dark:text-emerald-300',
    rowAccent: 'border-l-emerald-500',
  },
  {
    key: 2,
    label: 'Upsell',
    icon: <Zap className="w-3 h-3" />,
    accentBar: 'bg-blue-500',
    pillBg: 'bg-blue-100 dark:bg-blue-500/15',
    pillText: 'text-blue-800 dark:text-blue-300',
    rowAccent: 'border-l-blue-500',
  },
  {
    key: 3,
    label: 'Cross-sell',
    icon: <Sparkles className="w-3 h-3" />,
    accentBar: 'bg-violet-500',
    pillBg: 'bg-violet-100 dark:bg-violet-500/15',
    pillText: 'text-violet-800 dark:text-violet-300',
    rowAccent: 'border-l-violet-500',
  },
];

export default function ProductOfferViewModal({
  open,
  onClose,
  offer,
}: ProductOfferViewModalProps) {
  if (!offer) return null;

  const products: (ProductInSlot | null | undefined)[] = [
    offer.offer_1_product,
    offer.offer_2_product,
    offer.offer_3_product,
  ];
  const filledSlots = products.filter(Boolean).length;
  const icp = offer.icp;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
              <Package className="w-4 h-4" />
            </span>
            Product Offer Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* ─── Offer header card ──────────────────────────────── */}
          <section className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="bg-linear-to-br from-blue-50 via-indigo-50/60 to-violet-50/40 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-violet-950/40 px-5 py-4 border-b border-border relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
              <div className="pl-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Offer
                  </p>
                  <h3 className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                    {offer.offer_name || '—'}
                  </h3>
                </div>
                <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30 text-[11px] font-semibold shadow-sm shrink-0">
                  {filledSlots} / 3 {filledSlots === 1 ? 'slot' : 'slots'} filled
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <Stat
                icon={<Tag className="w-4 h-4" />}
                label="Offer ID"
                value={offer.offer_id}
                tint="indigo"
                mono
              />
              <Stat
                icon={<Target className="w-4 h-4" />}
                label="ICP"
                value={icp?.icp_name ?? offer.icp_id ?? '—'}
                tint="amber"
              />
              <Stat
                icon={<Calendar className="w-4 h-4" />}
                label="Created"
                value={offer.created_at ? formatDateTimeShort(offer.created_at) : '—'}
                tint="emerald"
              />
            </div>
          </section>

          {/* ─── ICP details table ──────────────────────────────── */}
          <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-amber-50 to-amber-50/30 dark:from-amber-950/40 dark:to-amber-950/40 border-b border-border">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-100 text-amber-600">
                <Users className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Target ICP</p>
            </div>

            {icp ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <Th>Field</Th>
                      <Th>Value</Th>
                    </tr>
                  </thead>
                  <tbody>
                    <TableRow
                      label="ICP Name"
                      value={icp.icp_name}
                      highlight
                    />
                    <TableRow
                      label="ICP ID"
                      value={icp.icp_id}
                      mono
                    />
                    <TableRow
                      label="Description"
                      value={icp.icp_desc || '—'}
                      multiline
                    />
                    <TableRow
                      label="ICP Created"
                      value={
                        icp.created_at ? formatDateTimeShort(icp.created_at) : '—'
                      }
                    />
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyRow message="No ICP linked to this offer." />
            )}
          </section>

          {/* ─── Products table ─────────────────────────────────── */}
          <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-50 to-blue-50/30 dark:from-emerald-950/40 dark:to-blue-950/40 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-600">
                  <Package className="w-3.5 h-3.5" />
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Bundled Products</p>
              </div>
              <Badge variant="secondary" className="text-[10px] tabular-nums">
                {filledSlots} of 3 filled
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <Th className="w-32">Slot</Th>
                    <Th>Product</Th>
                    <Th className="w-32">Product ID</Th>
                    <Th className="w-32">Pricing</Th>
                    <Th className="w-28 text-right">Price</Th>
                  </tr>
                </thead>
                <tbody>
                  {SLOT_META.map((sv, i) => {
                    const p = products[i];
                    if (!p) {
                      return (
                        <tr
                          key={sv.key}
                          className={`border-b border-border last:border-0 border-l-2 border-l-border bg-muted/50`}
                        >
                          <td className="py-2.5 px-3">
                            <SlotChip meta={sv} muted />
                          </td>
                          <td
                            colSpan={4}
                            className="py-2.5 px-3 text-[11px] text-slate-400 dark:text-slate-500 italic"
                          >
                            Empty slot — add a product from the edit form
                          </td>
                        </tr>
                      );
                    }
                    const pricingKey = p.pricing_type?.toLowerCase() || 'default';
                    const pricingCfg =
                      pricingTypeConfig[pricingKey] || pricingTypeConfig['default'];
                    return (
                      <tr
                        key={sv.key}
                        className={`border-b border-border last:border-0 border-l-2 ${sv.rowAccent} hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors`}
                      >
                        <td className="py-2.5 px-3">
                          <SlotChip meta={sv} />
                        </td>
                        <td className="py-2.5 px-3 min-w-0">
                          <p
                            className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-65"
                            title={p.product_name}
                          >
                            {p.product_name}
                          </p>
                          {p.product_description && (
                            <p
                              className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-65 mt-0.5"
                              title={p.product_description}
                            >
                              {p.product_description}
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {p.product_id}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant="outline"
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${pricingCfg.color}`}
                          >
                            {pricingCfg.icon}
                            {p.pricing_type || 'N/A'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right whitespace-nowrap">
                          {formatPrice(p.price, p.pricing_type ?? undefined)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Slot legend footer */}
            <div className="bg-muted/50 border-t border-border px-4 py-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <Info className="w-3 h-3" />
              <span className="font-semibold uppercase tracking-wide">Slots:</span>
              {SLOT_META.map((m) => (
                <span
                  key={m.key}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${m.pillBg} ${m.pillText}`}
                >
                  {m.icon}
                  {m.label}
                </span>
              ))}
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
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100 truncate ${
            mono ? 'font-mono text-xs' : ''
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

interface SlotChipProps {
  meta: (typeof SLOT_META)[number];
  muted?: boolean;
}

function SlotChip({ meta, muted }: SlotChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
        muted ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500' : `${meta.pillBg} ${meta.pillText}`
      }`}
    >
      {meta.icon}
      Slot {meta.key} · {meta.label}
    </span>
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

function TableRow({
  label,
  value,
  mono,
  highlight,
  multiline,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  multiline?: boolean;
}) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors">
      <td className="py-2 px-3 w-40 text-[11px] font-medium text-slate-500 dark:text-slate-400 align-top whitespace-nowrap">
        {label}
      </td>
      <td
        className={`py-2 px-3 text-sm ${
          highlight ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-200'
        } ${mono ? 'font-mono text-xs' : ''} ${multiline ? 'whitespace-pre-wrap' : ''}`}
      >
        {value}
      </td>
    </tr>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="px-4 py-6 text-center text-[12px] text-slate-400 dark:text-slate-500 italic">
      {message}
    </div>
  );
}
