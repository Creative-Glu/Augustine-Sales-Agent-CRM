'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDateTimeShort } from '@/utils/format';
import { useProductOffers } from '@/services/product-offers/useProductOffers';
import type { Campaign } from '@/types/compaign';
import {
  Megaphone,
  Tag,
  Calendar,
  Target,
  Package,
  FileText,
  Star,
  Zap,
  Sparkles,
} from 'lucide-react';

interface CampaignViewModalProps {
  open: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

interface EnrichedOffer {
  offer_id: string;
  offer_name: string;
  icp?: { icp_id: string; icp_name: string } | null;
  offer_1_product?: { product_id: string; product_name: string } | null;
  offer_2_product?: { product_id: string; product_name: string } | null;
  offer_3_product?: { product_id: string; product_name: string } | null;
}

interface StatusVisual {
  badge: string;
  gradient: string;
  accent: string;
  ring: string;
}

function statusVisual(status: string): StatusVisual {
  switch (status) {
    case 'Running':
      return {
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        gradient: 'from-emerald-50 via-emerald-50/60 to-blue-50/40',
        accent: 'bg-emerald-500',
        ring: 'ring-emerald-200',
      };
    case 'Active':
      return {
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        gradient: 'from-blue-50 via-blue-50/60 to-indigo-50/40',
        accent: 'bg-blue-500',
        ring: 'ring-blue-200',
      };
    case 'Draft':
      return {
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        gradient: 'from-slate-50 to-slate-100/60',
        accent: 'bg-slate-400',
        ring: 'ring-slate-200',
      };
    case 'Stopped':
      return {
        badge: 'bg-rose-100 text-rose-800 border-rose-200',
        gradient: 'from-rose-50 via-rose-50/60 to-orange-50/40',
        accent: 'bg-rose-500',
        ring: 'ring-rose-200',
      };
    default:
      return {
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        gradient: 'from-slate-50 to-slate-100/60',
        accent: 'bg-slate-400',
        ring: 'ring-slate-200',
      };
  }
}

const SLOT_VISUALS = [
  {
    key: 1,
    label: 'Primary',
    icon: <Star className="w-3 h-3" />,
    pillBg: 'bg-emerald-100',
    pillText: 'text-emerald-800',
    accentBar: 'bg-emerald-500',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    key: 2,
    label: 'Upsell',
    icon: <Zap className="w-3 h-3" />,
    pillBg: 'bg-blue-100',
    pillText: 'text-blue-800',
    accentBar: 'bg-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    key: 3,
    label: 'Cross-sell',
    icon: <Sparkles className="w-3 h-3" />,
    pillBg: 'bg-violet-100',
    pillText: 'text-violet-800',
    accentBar: 'bg-violet-500',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
];

export default function CampaignViewModal({ open, onClose, campaign }: CampaignViewModalProps) {
  const { data: offersData, isLoading: isOffersLoading } = useProductOffers();

  if (!campaign) return null;

  const offers = (offersData ?? []) as EnrichedOffer[];
  const fullOffer = offers.find((o) => o.offer_id === campaign.offer_id) ?? null;

  const offerName = fullOffer?.offer_name ?? campaign.offer?.offer_name ?? '—';
  const offerId = campaign.offer_id ?? '—';
  const icpName = fullOffer?.icp?.icp_name ?? null;
  const sv = statusVisual(campaign.campaign_status);

  const slots = [
    fullOffer?.offer_1_product,
    fullOffer?.offer_2_product,
    fullOffer?.offer_3_product,
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-160 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
              <Megaphone className="w-4 h-4" />
            </span>
            Campaign Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* ─── Campaign header card ───────────────────────────── */}
          <section className="rounded-xl border border-slate-200 bg-card overflow-hidden shadow-sm">
            <div
              className={`bg-linear-to-br ${sv.gradient} px-5 py-4 border-b border-slate-200 relative`}
            >
              {/* Status accent bar on left edge */}
              <div
                aria-hidden
                className={`absolute left-0 top-0 bottom-0 w-1 ${sv.accent}`}
              />
              <div className="pl-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Campaign
                  </p>
                  <h3 className="mt-0.5 text-base font-bold text-slate-900 truncate">
                    {campaign.campaign_name || '—'}
                  </h3>
                </div>
                <Badge
                  className={`text-[11px] font-semibold border ring-1 shadow-sm shrink-0 ${sv.badge} ${sv.ring}`}
                >
                  {campaign.campaign_status || '—'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <ColoredStat
                icon={<Tag className="w-4 h-4" />}
                label="Campaign ID"
                value={String(campaign.campaign_id)}
                tint="indigo"
                mono
              />
              <ColoredStat
                icon={<Calendar className="w-4 h-4" />}
                label="Created"
                value={campaign.createdat ? formatDateTimeShort(campaign.createdat) : '—'}
                tint="amber"
              />
            </div>
          </section>

          {/* ─── Instructions card ──────────────────────────────── */}
          <section className="rounded-xl border border-slate-200 bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-slate-50 to-blue-50/40 border-b border-slate-200">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-600">
                <FileText className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold text-slate-900">Instructions</p>
              <span className="text-[10px] text-slate-500 ml-auto">
                {campaign.instructions?.length ?? 0} chars
              </span>
            </div>
            <div className="p-4">
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 max-h-50 overflow-y-auto">
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {campaign.instructions?.trim() || (
                    <span className="italic text-slate-400">No instructions provided.</span>
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* ─── Linked Offer card ──────────────────────────────── */}
          <section className="rounded-xl border border-slate-200 bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-amber-50 to-amber-50/40 border-b border-slate-200">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-100 text-amber-600">
                <Target className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold text-slate-900">Linked Offer</p>
              {isOffersLoading && (
                <span className="text-[10px] text-slate-500 ml-auto">Loading…</span>
              )}
            </div>

            <div className="p-4 space-y-4">
              {/* Offer info chips row */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <Chip
                  icon={<Package className="w-3 h-3" />}
                  label={offerName}
                  tint="emerald"
                />
                <Chip
                  icon={<Tag className="w-3 h-3" />}
                  label={offerId}
                  tint="slate"
                  mono
                />
                {icpName && (
                  <Chip
                    icon={<Target className="w-3 h-3" />}
                    label={icpName}
                    tint="amber"
                  />
                )}
              </div>

              {/* Bundled products — color-coded by slot */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Bundled Products
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SLOT_VISUALS.map((sv, i) => {
                    const product = slots[i];
                    const hasProduct = !!product;
                    return (
                      <div
                        key={sv.key}
                        className={`relative rounded-lg border bg-white overflow-hidden ${
                          hasProduct
                            ? 'border-slate-200 shadow-sm'
                            : 'border-dashed border-slate-300 bg-slate-50/40'
                        }`}
                      >
                        {/* Left accent bar */}
                        <div
                          aria-hidden
                          className={`absolute left-0 top-0 bottom-0 w-1 ${
                            hasProduct ? sv.accentBar : 'bg-slate-300'
                          }`}
                        />
                        <div className="pl-3 pr-2.5 py-2">
                          <div className="flex items-center gap-1 mb-1">
                            <span
                              className={`inline-flex items-center justify-center w-4 h-4 rounded-sm ${
                                hasProduct ? sv.iconBg : 'bg-slate-100'
                              } ${hasProduct ? sv.iconColor : 'text-slate-400'}`}
                            >
                              {sv.icon}
                            </span>
                            <p
                              className={`text-[9px] font-bold uppercase tracking-wider ${
                                hasProduct ? sv.pillText : 'text-slate-400'
                              }`}
                            >
                              Slot {sv.key} · {sv.label}
                            </p>
                          </div>
                          <p
                            className={`text-sm font-semibold truncate ${
                              hasProduct ? 'text-slate-900' : 'text-slate-400 italic'
                            }`}
                            title={product?.product_name ?? ''}
                          >
                            {product?.product_name ?? 'Empty'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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

interface ChipProps {
  icon: React.ReactNode;
  label: string;
  tint: 'amber' | 'slate' | 'indigo' | 'emerald';
  mono?: boolean;
}

function Chip({ icon, label, tint, mono }: ChipProps) {
  const tintMap: Record<ChipProps['tint'], string> = {
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
