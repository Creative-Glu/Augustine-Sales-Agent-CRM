'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatPrice } from '@/utils/format';
import { pricingTypeConfig } from '@/constants/pricing-types';
import { useOffersForProduct } from '@/services/products/useProducts';
import type { Product } from '@/types/product';
import {
  Package,
  Tag,
  Calendar,
  DollarSign,
  Target,
  Inbox,
  AlertCircle,
  Layers,
  ArrowUpRight,
  Star,
  Zap,
  Sparkles,
} from 'lucide-react';

interface ProductViewModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

type SlotKey = 1 | 2 | 3;

interface SlotMeta {
  key: SlotKey;
  label: string;
  shortLabel: string;
  description: string;
  color: string; // base color name
  // Tailwind class fragments (must be explicit strings so JIT picks them up)
  pillBg: string;
  pillText: string;
  pillRing: string;
  accentBar: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

const SLOT_META: Record<SlotKey, SlotMeta> = {
  1: {
    key: 1,
    label: 'Primary',
    shortLabel: 'Slot 1',
    description: 'Primary pitch',
    color: 'emerald',
    pillBg: 'bg-emerald-100',
    pillText: 'text-emerald-800',
    pillRing: 'ring-emerald-200',
    accentBar: 'bg-emerald-500',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    icon: <Star className="w-3 h-3" />,
  },
  2: {
    key: 2,
    label: 'Upsell',
    shortLabel: 'Slot 2',
    description: 'Upsell add-on',
    color: 'blue',
    pillBg: 'bg-blue-100',
    pillText: 'text-blue-800',
    pillRing: 'ring-blue-200',
    accentBar: 'bg-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: <Zap className="w-3 h-3" />,
  },
  3: {
    key: 3,
    label: 'Cross-sell',
    shortLabel: 'Slot 3',
    description: 'Cross-sell add-on',
    color: 'violet',
    pillBg: 'bg-violet-100',
    pillText: 'text-violet-800',
    pillRing: 'ring-violet-200',
    accentBar: 'bg-violet-500',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    icon: <Sparkles className="w-3 h-3" />,
  },
};

function whichSlotKey(
  offer: { offer_1?: string | null; offer_2?: string | null; offer_3?: string | null },
  productId: string
): SlotKey | null {
  if (offer.offer_1 === productId) return 1;
  if (offer.offer_2 === productId) return 2;
  if (offer.offer_3 === productId) return 3;
  return null;
}

export default function ProductViewModal({ open, onClose, product }: ProductViewModalProps) {
  const { data: offers, isLoading, isError } = useOffersForProduct(product?.product_id ?? null);

  if (!product) return null;

  const pricingKey = product.pricing_type?.toLowerCase() || 'default';
  const pricingCfg = pricingTypeConfig[pricingKey] || pricingTypeConfig['default'];
  const attached = offers ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-170 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
              <Package className="w-4 h-4" />
            </span>
            Product Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* ─── Product summary card ─────────────────────────────── */}
          <section className="rounded-xl border border-slate-200 bg-card overflow-hidden shadow-sm">
            <div className="bg-linear-to-br from-blue-50 via-indigo-50 to-violet-50 px-5 py-4 border-b border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Product
                  </p>
                  <h3 className="mt-0.5 text-base font-bold text-slate-900 truncate">
                    {product.product_name}
                  </h3>
                  {product.product_description && (
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {product.product_description}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 shadow-sm ${pricingCfg.color}`}
                >
                  {pricingCfg.icon}
                  {product.pricing_type || 'N/A'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <ColoredStat
                icon={<DollarSign className="w-4 h-4" />}
                label="Price"
                value={formatPrice(product.price, product.pricing_type)}
                tint="emerald"
              />
              <ColoredStat
                icon={<Tag className="w-4 h-4" />}
                label="Product ID"
                value={product.product_id}
                tint="indigo"
                mono
              />
              <ColoredStat
                icon={<Calendar className="w-4 h-4" />}
                label="Created"
                value={product.created_at ? formatDate(product.created_at) : '—'}
                tint="amber"
              />
            </div>
          </section>

          {/* ─── Attached offers ──────────────────────────────────── */}
          <section className="rounded-xl border border-slate-200 bg-card shadow-sm overflow-hidden">
            <div className="bg-linear-to-r from-slate-50 to-indigo-50/40 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-100 text-indigo-600">
                  <Layers className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Attached Product Offers</p>
                  <p className="text-[10px] text-slate-500">
                    Offers that bundle this product in one of their three slots
                  </p>
                </div>
              </div>
              {!isLoading && !isError && (
                <Badge
                  className={`tabular-nums shadow-sm ${
                    attached.length > 0
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {attached.length} {attached.length === 1 ? 'offer' : 'offers'}
                </Badge>
              )}
            </div>

            <div className="p-4">
              {/* Slot legend — small color key */}
              {!isLoading && !isError && attached.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px] text-slate-500">
                  <span className="font-semibold uppercase tracking-wide">Slots:</span>
                  {([1, 2, 3] as SlotKey[]).map((k) => {
                    const m = SLOT_META[k];
                    return (
                      <span
                        key={k}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${m.pillBg} ${m.pillText}`}
                      >
                        {m.icon}
                        {m.label}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              )}

              {/* Error */}
              {!isLoading && isError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-center">
                  <AlertCircle className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                  <p className="text-[12px] font-medium text-rose-800">
                    Failed to load attached offers
                  </p>
                </div>
              )}

              {/* Empty */}
              {!isLoading && !isError && attached.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 mb-2">
                    <Inbox className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-[12px] font-semibold text-slate-700">Not bundled yet</p>
                  <p
                    className="text-[11px] text-slate-500 mt-0.5 mx-auto leading-relaxed"
                    style={{ maxWidth: '20rem' }}
                  >
                    This product isn&apos;t included in any product offers. Add it to an
                    offer&apos;s slot from the Offers page.
                  </p>
                </div>
              )}

              {/* Offer cards */}
              {!isLoading && !isError && attached.length > 0 && (
                <ul className="space-y-2">
                  {attached.map((offer) => {
                    const slotKey = whichSlotKey(offer, product.product_id);
                    const meta = slotKey ? SLOT_META[slotKey] : null;
                    return (
                      <li key={offer.offer_id}>
                        <a
                          href={`/product-offers?offer=${offer.offer_id}`}
                          className="group relative block rounded-lg border border-slate-200 bg-white hover:bg-blue-50/40 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
                        >
                          {/* Left-side colored accent bar */}
                          {meta && (
                            <div
                              aria-hidden
                              className={`absolute left-0 top-0 bottom-0 w-1.5 ${meta.accentBar}`}
                            />
                          )}

                          <div className="pl-4 pr-3 py-3">
                            {/* Top row: name + slot pill + arrow */}
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-bold text-slate-900 truncate">
                                    {offer.offer_name}
                                  </p>
                                  {meta && (
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${meta.pillBg} ${meta.pillText} ${meta.pillRing}`}
                                    >
                                      {meta.icon}
                                      {meta.shortLabel} · {meta.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </div>

                            {/* Meta row: ICP, ID, date — each in its own colored chip */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              <ColoredChip
                                icon={<Target className="w-3 h-3" />}
                                label={offer.icp?.icp_name ?? offer.icp_id ?? '—'}
                                tint="amber"
                              />
                              <ColoredChip
                                icon={<Tag className="w-3 h-3" />}
                                label={offer.offer_id}
                                tint="slate"
                                mono
                              />
                              {offer.created_at && (
                                <ColoredChip
                                  icon={<Calendar className="w-3 h-3" />}
                                  label={formatDate(offer.created_at)}
                                  tint="indigo"
                                />
                              )}
                            </div>
                          </div>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

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

interface ColoredStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: 'emerald' | 'indigo' | 'amber';
  mono?: boolean;
}

function ColoredStat({ icon, label, value, tint, mono }: ColoredStatProps) {
  const tintMap: Record<ColoredStatProps['tint'], { bg: string; text: string }> = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  };
  const t = tintMap[tint];
  return (
    <div className="px-4 py-3 flex items-start gap-3">
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${t.bg} ${t.text} shrink-0`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm font-bold text-slate-900 ${
            mono ? 'font-mono text-xs' : ''
          } truncate`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

interface ColoredChipProps {
  icon: React.ReactNode;
  label: string;
  tint: 'amber' | 'slate' | 'indigo' | 'emerald';
  mono?: boolean;
}

function ColoredChip({ icon, label, tint, mono }: ColoredChipProps) {
  const tintMap: Record<ColoredChipProps['tint'], string> = {
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-medium ${
        tintMap[tint]
      } ${mono ? 'font-mono text-[10px]' : ''}`}
    >
      {icon}
      <span className="truncate max-w-50">{label}</span>
    </span>
  );
}
