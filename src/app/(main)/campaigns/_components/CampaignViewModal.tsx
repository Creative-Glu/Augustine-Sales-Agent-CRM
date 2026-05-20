'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate } from '@/utils/format';
import { useProductOffers } from '@/services/product-offers/useProductOffers';
import type { Campaign } from '@/types/compaign';

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

export default function CampaignViewModal({ open, onClose, campaign }: CampaignViewModalProps) {
  const { data: offersData, isLoading: isOffersLoading } = useProductOffers();

  if (!campaign) return null;

  const offers = (offersData ?? []) as EnrichedOffer[];
  const fullOffer = offers.find((o) => o.offer_id === campaign.offer_id) ?? null;

  const offerName = fullOffer?.offer_name ?? campaign.offer?.offer_name ?? '—';
  const offerId = campaign.offer_id ?? '—';
  const icpName = fullOffer?.icp?.icp_name ?? null;

  const offerSlots = [
    { label: 'Offer 1', product: fullOffer?.offer_1_product },
    { label: 'Offer 2', product: fullOffer?.offer_2_product },
    { label: 'Offer 3', product: fullOffer?.offer_3_product },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Campaign Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Campaign summary */}
          <section className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Campaign
                </p>
                <h3 className="mt-0.5 text-base font-semibold text-card-foreground truncate">
                  {campaign.campaign_name || '—'}
                </h3>
              </div>
              <span className={statusBadgeClass(campaign.campaign_status)}>
                {campaign.campaign_status || '—'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Campaign ID</p>
                <p className="mt-0.5 text-sm text-card-foreground tabular-nums">
                  {campaign.campaign_id}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Created</p>
                <p className="mt-0.5 text-sm text-card-foreground tabular-nums">
                  {campaign.createdat ? formatDate(campaign.createdat) : '—'}
                </p>
              </div>
            </div>
          </section>

          {/* Instructions — scrollable */}
          <section>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
              Instructions
            </p>
            <div className="rounded-lg border border-border bg-muted/30 p-3 max-h-[200px] overflow-y-auto">
              <p className="text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">
                {campaign.instructions?.trim() || 'No instructions provided.'}
              </p>
            </div>
          </section>

          {/* Offer details */}
          <section className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Linked Offer
              </p>
              {isOffersLoading && (
                <span className="text-[10px] text-muted-foreground">Loading offer…</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Offer Name</p>
                <p className="mt-0.5 text-sm text-card-foreground">{offerName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Offer ID</p>
                <p className="mt-0.5 text-sm text-card-foreground tabular-nums">{offerId}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-muted-foreground">ICP</p>
                <p className="mt-0.5 text-sm text-card-foreground">{icpName ?? '—'}</p>
              </div>
            </div>

            <div className="pt-1">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Bundled Products</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {offerSlots.map((slot) => (
                  <div
                    key={slot.label}
                    className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {slot.label}
                    </p>
                    <p
                      className="mt-0.5 text-sm text-card-foreground truncate"
                      title={slot.product?.product_name ?? ''}
                    >
                      {slot.product?.product_name ?? '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
