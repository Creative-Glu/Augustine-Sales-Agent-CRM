'use client';

import { Users, TrendingUp, Trophy, Clock, Activity } from 'lucide-react';
import { Journey } from '@/types/Journey';

const ENGAGED_STAGES = new Set(['Engaged', 'MQL', 'SAL', 'SQL', 'Closed-Won']);
const INACTIVE_STAGES = new Set(['Closed-Lost', 'Disqualified', 'Paused']);
const STALE_DAYS = 14;

interface JourneyKpiTilesProps {
  journeys: Journey[];
}

interface TileProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}

function Tile({ label, value, sub, icon, accent }: TileProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200/60 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <div className={`p-2 rounded-lg ${accent}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
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

  const staleCutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  const stale = journeys.filter((j) => {
    if (INACTIVE_STAGES.has(j.funnel_stage)) return false;
    const t = new Date(j.last_interaction).getTime();
    return !Number.isNaN(t) && t < staleCutoff;
  }).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Tile
        label="Total Journeys"
        value={total.toString()}
        sub={`${uniqueLeads} unique leads`}
        icon={<Users className="w-4 h-4 text-blue-600" />}
        accent="bg-blue-100"
      />
      <Tile
        label="Active"
        value={active.toString()}
        sub={total > 0 ? `${Math.round((active / total) * 100)}% of total` : '—'}
        icon={<Activity className="w-4 h-4 text-emerald-600" />}
        accent="bg-emerald-100"
      />
      <Tile
        label="Engagement Rate"
        value={`${engagementRate}%`}
        sub={`${engaged} engaged or beyond`}
        icon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
        accent="bg-indigo-100"
      />
      <Tile
        label="Conversion Rate"
        value={`${conversionRate}%`}
        sub={`${won} closed-won`}
        icon={<Trophy className="w-4 h-4 text-amber-600" />}
        accent="bg-amber-100"
      />
      <Tile
        label="Stale Leads"
        value={stale.toString()}
        sub={`No activity in ${STALE_DAYS}+ days`}
        icon={<Clock className="w-4 h-4 text-rose-600" />}
        accent="bg-rose-100"
      />
    </div>
  );
}
