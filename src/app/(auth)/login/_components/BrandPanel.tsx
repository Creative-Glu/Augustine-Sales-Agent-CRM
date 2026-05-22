import Image from 'next/image';
import { ShieldCheck, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { APP_VERSION } from '@/constants/login';
import { RotatingHero } from './RotatingHero';
import { FeatureItem } from './FeatureItem';
import { SystemBadge } from './SystemBadge';

export function BrandPanel() {
  return (
    <section className="hidden lg:block relative overflow-hidden bg-slate-900 text-slate-100">
      {/* Background gradient via inline style (Tailwind v4 compat) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e3a8a 100%)',
        }}
      />
      {/* Decorative glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 rounded-full"
        style={{
          width: '24rem',
          height: '24rem',
          background: 'rgba(59,130,246,0.20)',
          filter: 'blur(64px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-20 rounded-full"
        style={{
          width: '28rem',
          height: '28rem',
          background: 'rgba(99,102,241,0.10)',
          filter: 'blur(64px)',
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        {/* Top: Logo */}
        <div>
          <Image
            src="/augustine-logo.png"
            alt="Augustine Institute"
            width={400}
            height={96}
            className="h-16 w-auto object-contain drop-shadow-lg"
            priority
            quality={100}
          />
        </div>

        {/* Middle: Headline + features */}
        <div className="space-y-8">
          <div className="space-y-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
              style={{
                background: 'rgba(59,130,246,0.15)',
                borderColor: 'rgba(96,165,250,0.20)',
                color: '#93c5fd',
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Lead Gen &amp; Outreach Operations
            </span>

            <RotatingHero />
          </div>

          <ul className="space-y-3 text-sm">
            <FeatureItem icon={<Zap className="h-4 w-4" />}>
              Real-time funnel updates from email clicks &amp; replies
            </FeatureItem>
            <FeatureItem icon={<ShieldCheck className="h-4 w-4" />}>
              Slack alerts the moment a lead shows buying intent
            </FeatureItem>
            <FeatureItem icon={<CheckCircle2 className="h-4 w-4" />}>
              ICP-driven targeting with measurable, per-campaign ROI
            </FeatureItem>
          </ul>
        </div>

        {/* Bottom: System badges */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <SystemBadge label="Build" value={APP_VERSION} />
          <SystemBadge
            label="Status"
            value={
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ background: '#34d399' }}
                />
                Operational
              </span>
            }
          />
          <SystemBadge label="Region" value="US-East" />
        </div>
      </div>
    </section>
  );
}
