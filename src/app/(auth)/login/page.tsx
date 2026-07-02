'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, ShieldCheck, Sparkles, Zap, CheckCircle2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const APP_VERSION = 'v0.1.0';

interface HeroSlide {
  headline: string;
  accent: string;
  subline: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    headline: 'Run your Catholic outreach with',
    accent: 'intelligence at scale.',
    subline:
      'Personalised outreach to parishes, dioceses, and ministries — powered by your campaigns, ICPs, and an AI agent that actually understands the mission.',
  },
  {
    headline: 'Turn cold parish leads into',
    accent: 'warm conversations.',
    subline:
      'Every reply is classified, every click is tracked — so your team focuses only on the leads ready to move.',
  },
  {
    headline: 'Reach every diocese with the',
    accent: 'right message at the right time.',
    subline:
      'Run campaigns tailored to ICPs across thousands of Catholic institutions — from one dashboard, no spreadsheets, no copy-paste.',
  },
  {
    headline: 'Where ministry vision meets',
    accent: 'measurable impact.',
    subline:
      'Built for evangelization-driven teams who need ROI visibility without compromising the Catholic mission.',
  },
  {
    headline: 'From cold lead to scheduled call in',
    accent: 'under 48 hours.',
    subline:
      'Real-time Slack alerts, automatic funnel transitions, and AI-drafted replies that sound like your best rep on their best day.',
  },
];

const SLIDE_INTERVAL_MS = 5000;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);

    if (!result.success) {
      toast({
        title: 'Login failed',
        description: result.error ?? 'Invalid email or password',
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Login successful', description: 'Welcome back!' });
    router.push('/execution-dashboard');
  };

  return (
    <div
      className="min-h-screen w-full bg-background grid grid-cols-1 lg:grid-cols-2"
      style={{ width: '100%' }}
    >
      {/* ─── LEFT: Brand panel (desktop only) ────────────────────── */}
      <section className="hidden lg:block relative overflow-hidden bg-slate-900 text-slate-100">
        {/* Background gradient via inline style (Tailwind v4 compat) */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e3a8a 100%)',
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

      {/* ─── RIGHT: Form panel ───────────────────────────────────── */}
      <section className="flex flex-col">
        {/* Mobile-only brand strip */}
        <div
          className="lg:hidden px-6 py-8 flex flex-col items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #020617 0%, #1e3a8a 100%)',
          }}
        >
          <Image
            src="/augustine-logo.png"
            alt="Augustine Institute"
            width={280}
            height={67}
            className="h-12 w-auto object-contain"
            priority
            quality={100}
          />
          <p className="text-xs font-medium tracking-wide text-blue-200">
            Lead Gen &amp; Outreach Operations
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10 lg:py-12">
          <div className="w-full" style={{ maxWidth: '28rem' }}>
            <header className="mb-6 space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sign in to continue managing your outreach campaigns.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  htmlFor="email"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@augustineinstitute.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-card border-border text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                  <Info className="h-3 w-3 mt-0.5 shrink-0" />
                  Use the email address provided by your administrator.
                </p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700"
                    onClick={() =>
                      toast({
                        title: 'Need help signing in?',
                        description:
                          'Contact your workspace admin to reset your password.',
                      })
                    }
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 bg-card border-border text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                  <ShieldCheck className="h-3 w-3 mt-0.5 shrink-0 text-emerald-500" />
                  Your session is secured with token-based authentication.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full text-white font-semibold"
                style={{
                  background:
                    'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            {/* Helpful hint card */}
            <div className="mt-6 rounded-lg border border-blue-100 dark:border-blue-500/30 bg-blue-50/60 dark:bg-blue-500/15 px-4 py-3">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">First time here?</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-blue-800/80 dark:text-blue-200">
                Access is invite-only. If you don&apos;t have credentials yet, ask your
                administrator to add you in the Roles section.
              </p>
            </div>

            <div className="mt-6 text-center space-y-1">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                © {new Date().getFullYear()} Augustine Institute. All rights reserved.
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Build {APP_VERSION} · Secure connection
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Small helpers ────────────────────────────────────────────── */

function RotatingHero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const slide = HERO_SLIDES[index];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative"
      style={{ minHeight: '11rem' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-3"
        >
          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
            {slide.headline}{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #93c5fd 0%, #67e8f9 100%)',
              }}
            >
              {slide.accent}
            </span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
            {slide.subline}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Pagination dots */}
      <div className="absolute -bottom-6 left-0 flex items-center gap-1.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === index ? '1.25rem' : '0.375rem',
              height: '0.375rem',
              background:
                i === index ? 'rgba(147,197,253,0.9)' : 'rgba(148,163,184,0.4)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{
          background: 'rgba(59,130,246,0.15)',
          color: '#93c5fd',
          boxShadow: 'inset 0 0 0 1px rgba(96,165,250,0.20)',
        }}
      >
        {icon}
      </span>
      <span className="leading-relaxed" style={{ color: 'rgba(226,232,240,0.90)' }}>
        {children}
      </span>
    </li>
  );
}

function SystemBadge({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{
        background: 'rgba(15,23,42,0.40)',
        borderColor: 'rgba(51,65,85,0.60)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <p
        className="text-[10px] font-medium uppercase tracking-wide truncate"
        style={{ color: '#94a3b8' }}
      >
        {label}
      </p>
      <div className="mt-0.5 text-xs font-semibold text-slate-100">{value}</div>
    </div>
  );
}
