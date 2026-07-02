'use client';

import { Users, TrendingUp, Trophy, Clock, Activity } from 'lucide-react';
import { Journey } from '@/types/Journey';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { TrendBadge } from '@/components/TrendBadge';

const ENGAGED_STAGES = new Set(['Engaged', 'MQL', 'SAL', 'SQL', 'Closed-Won']);
const INACTIVE_STAGES = new Set(['Closed-Lost', 'Disqualified', 'Paused']);
const STALE_DAYS = 14;
const PERIOD_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

interface JourneyKpiTilesProps {
  journeys: Journey[];
}

interface TileProps {
  label: string;
  value: number;
  suffix?: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  trend?: { current: number; previous: number; variant?: 'up-good' | 'up-bad' };
}

function Tile({ label, value, suffix, sub, icon, accent, trend }: TileProps) {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-md border border-border/60 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <div className={`p-2 rounded-lg ${accent}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 tabular-nums">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        {sub && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{sub}</p>}
        {trend && (
          <TrendBadge
            current={trend.current}
            previous={trend.previous}
            variant={trend.variant}
            periodLabel="vs prev 7d"
          />
        )}
      </div>
    </div>
  );
}

export default function JourneyKpiTiles({ journeys }: JourneyKpiTilesProps) {
  const total = journeys.length;
  const uniqueLeads = new Set(journeys.map((j) => j.lead_id)).size;

  const active = journeys.filter((j) => !INACTIVE_STAGES.has(j.funnel_stage)).length;
  const engaged = journeys.filter((j) => ENGAGED_STAGES.has(j.funnel_stage)).length;
  const won = journeys.filter((j) => j.funnel_stage === 'Closed-Won').length;

  const engagementRate = total > 0 ? Math.round((engaged / total) * 100) : 0;
  const conversionRate = total > 0 ? Math.round((won / total) * 100) : 0;

  const staleCutoff = Date.now() - STALE_DAYS * DAY_MS;
  const stale = journeys.filter((j) => {
    if (INACTIVE_STAGES.has(j.funnel_stage)) return false;
    const t = new Date(j.last_interaction).getTime();
    return !Number.isNaN(t) && t < staleCutoff;
  }).length;

  // ─── Period-over-period trends (last 7d vs. prior 7d, by created_at) ───
  const now = Date.now();
  const currentStart = now - PERIOD_DAYS * DAY_MS;
  const previousStart = now - 2 * PERIOD_DAYS * DAY_MS;

  const inWindow = (iso: string, from: number, to: number) => {
    const t = new Date(iso).getTime();
    return !Number.isNaN(t) && t >= from && t < to;
  };

  const currentJourneys = journeys.filter((j) =>
    inWindow(j.created_at, currentStart, now)
  );
  const previousJourneys = journeys.filter((j) =>
    inWindow(j.created_at, previousStart, currentStart)
  );

  const trendTotal = { current: currentJourneys.length, previous: previousJourneys.length };
  const trendActive = {
    current: currentJourneys.filter((j) => !INACTIVE_STAGES.has(j.funnel_stage)).length,
    previous: previousJourneys.filter((j) => !INACTIVE_STAGES.has(j.funnel_stage)).length,
  };
  const trendWon = {
    current: currentJourneys.filter((j) => j.funnel_stage === 'Closed-Won').length,
    previous: previousJourneys.filter((j) => j.funnel_stage === 'Closed-Won').length,
  };
  const trendStale = {
    current: currentJourneys.filter((j) => {
      if (INACTIVE_STAGES.has(j.funnel_stage)) return false;
      const t = new Date(j.last_interaction).getTime();
      return !Number.isNaN(t) && t < staleCutoff;
    }).length,
    previous: previousJourneys.filter((j) => {
      if (INACTIVE_STAGES.has(j.funnel_stage)) return false;
      const t = new Date(j.last_interaction).getTime();
      return !Number.isNaN(t) && t < staleCutoff;
    }).length,
  };
  const trendEngaged = {
    current: currentJourneys.filter((j) => ENGAGED_STAGES.has(j.funnel_stage)).length,
    previous: previousJourneys.filter((j) => ENGAGED_STAGES.has(j.funnel_stage)).length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Tile
        label="Total Journeys"
        value={total}
        sub={`${uniqueLeads} unique leads`}
        icon={<Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        accent="bg-blue-100 dark:bg-blue-500/15"
        trend={trendTotal}
      />
      <Tile
        label="Active"
        value={active}
        sub={total > 0 ? `${Math.round((active / total) * 100)}% of total` : '—'}
        icon={<Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
        accent="bg-emerald-100 dark:bg-emerald-500/15"
        trend={trendActive}
      />
      <Tile
        label="Engagement Rate"
        value={engagementRate}
        suffix="%"
        sub={`${engaged} engaged or beyond`}
        icon={<TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
        accent="bg-indigo-100 dark:bg-indigo-500/15"
        trend={trendEngaged}
      />
      <Tile
        label="Conversion Rate"
        value={conversionRate}
        suffix="%"
        sub={`${won} closed-won`}
        icon={<Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
        accent="bg-amber-100 dark:bg-amber-500/15"
        trend={trendWon}
      />
      <Tile
        label="Stale Leads"
        value={stale}
        sub={`No activity in ${STALE_DAYS}+ days`}
        icon={<Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
        accent="bg-rose-100 dark:bg-rose-500/15"
        trend={{ ...trendStale, variant: 'up-bad' }}
      />
    </div>
  );
}
