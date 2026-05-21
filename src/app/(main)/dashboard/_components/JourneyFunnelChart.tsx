'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useDashboardAnalytics } from '@/services/analytics/useDashboardAnalytics';
import { Skeleton } from '@/components/Skeleton';
import { motion } from 'framer-motion';
import { STAGE_COLORS } from '@/constants/journey';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FUNNEL_STAGES = ['Outreached', 'Engaged', 'MQL', 'SAL', 'SQL', 'Closed-Won'] as const;

function rate(numerator: number, denominator: number): string {
  if (denominator <= 0) return '0';
  return ((numerator / denominator) * 100).toFixed(1);
}

export default function JourneyFunnelChart() {
  const { data, isLoading } = useDashboardAnalytics();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dark:bg-slate-900 duration-300"
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          Journey Funnel Analysis
        </h3>
        <div className="space-y-4">
          <Skeleton height="24px" width="80%" />
          <Skeleton height="24px" width="90%" />
          <Skeleton height="24px" width="70%" />
          <Skeleton height="300px" className="mt-4" />
        </div>
      </motion.div>
    );
  }

  const totalJourneys = data?.journeys ?? 0;
  const stageCounts = data?.stageCounts ?? {};

  const funnelData = FUNNEL_STAGES.map((stage) => ({
    stage,
    count: stageCounts[stage] ?? 0,
  }));

  const wonCount = stageCounts['Closed-Won'] ?? 0;
  const lostCount = stageCounts['Closed-Lost'] ?? 0;
  const disqualifiedCount = stageCounts['Disqualified'] ?? 0;

  const overallConversionRate = rate(wonCount, totalJourneys);
  const closedTotal = wonCount + lostCount;
  const winRate = rate(wonCount, closedTotal);

  const dataChart = {
    labels: FUNNEL_STAGES as unknown as string[],
    datasets: [
      {
        label: 'Journeys',
        data: funnelData.map((s) => s.count),
        backgroundColor: FUNNEL_STAGES.map((s) => STAGE_COLORS[s] ?? '#94a3b8'),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="dark:bg-slate-900 duration-300"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-2">
          Journey Funnel Analysis
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Live conversion across funnel stages — counts pulled directly from the journeys table
        </p>
        <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-4" />
      </motion.div>

      {/* Stage tiles — colored accent bar + larger numbers + share bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
      >
        {funnelData.map((s, index) => {
          const color = STAGE_COLORS[s.stage] ?? '#94a3b8';
          const sharePct = totalJourneys > 0 ? (s.count / totalJourneys) * 100 : 0;
          const shareLabel = sharePct.toFixed(0);
          return (
            <motion.div
              key={s.stage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Left accent bar — colored per stage */}
              <div
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: color }}
              />
              <div className="pl-3.5 pr-3 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {s.stage}
                  </p>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <p
                  className="text-2xl font-bold tabular-nums leading-none"
                  style={{ color: color }}
                >
                  {s.count}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 mb-1">
                  {shareLabel}% of total
                </p>
                {/* Share bar */}
                <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, sharePct)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Adjacent-stage conversion rates */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
      >
        {FUNNEL_STAGES.slice(0, -1).map((from, i) => {
          const to = FUNNEL_STAGES[i + 1];
          const fromCount = stageCounts[from] ?? 0;
          const toCount = stageCounts[to] ?? 0;
          const pct = parseFloat(rate(toCount, fromCount));
          // Color the rate based on how healthy the conversion is
          let rateColor = 'text-slate-500';
          let rateBg = 'bg-slate-50 dark:bg-slate-800';
          if (pct >= 50) {
            rateColor = 'text-emerald-700';
            rateBg = 'bg-emerald-50 dark:bg-emerald-950/30';
          } else if (pct >= 20) {
            rateColor = 'text-amber-700';
            rateBg = 'bg-amber-50 dark:bg-amber-950/30';
          } else if (pct > 0) {
            rateColor = 'text-rose-700';
            rateBg = 'bg-rose-50 dark:bg-rose-950/30';
          }
          return (
            <div
              key={`${from}->${to}`}
              className={`p-3 rounded-xl border border-slate-200 dark:border-slate-700 ${rateBg} transition-colors`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: STAGE_COLORS[from] ?? '#94a3b8' }}
                />
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider truncate flex-1">
                  {from} → {to}
                </p>
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: STAGE_COLORS[to] ?? '#94a3b8' }}
                />
              </div>
              <p className={`text-xl font-bold tabular-nums ${rateColor} dark:text-white`}>
                {rate(toCount, fromCount)}%
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                {toCount} of {fromCount}
              </p>
            </div>
          );
        })}
      </motion.div>

      {/* Bar chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <div style={{ height: '350px' }}>
          <Bar
            data={dataChart}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            }}
          />
        </div>
      </motion.div>

      {/* Summary footer — colored accent bars + larger numbers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <SummaryTile
          tint="blue"
          label="Overall conversion"
          value={`${overallConversionRate}%`}
          subtitle={`${wonCount} Closed-Won of ${totalJourneys} journeys`}
        />
        <SummaryTile
          tint="emerald"
          label="Win rate (of closed)"
          value={`${winRate}%`}
          subtitle={`${wonCount} won vs ${lostCount} lost`}
        />
        <SummaryTile
          tint="rose"
          label="Disqualified"
          value={String(disqualifiedCount)}
          subtitle={`${rate(disqualifiedCount, totalJourneys)}% of total`}
        />
      </motion.div>
    </motion.div>
  );
}

/* ─── Helper ──────────────────────────────────────────────────── */

interface SummaryTileProps {
  tint: 'blue' | 'emerald' | 'rose';
  label: string;
  value: string;
  subtitle: string;
}

function SummaryTile({ tint, label, value, subtitle }: SummaryTileProps) {
  const map: Record<
    SummaryTileProps['tint'],
    { accent: string; bg: string; valueColor: string; labelColor: string }
  > = {
    blue: {
      accent: 'bg-blue-500',
      bg: 'bg-linear-to-br from-blue-50 to-blue-50/40 dark:from-blue-950/30 dark:to-blue-950/10',
      valueColor: 'text-blue-700 dark:text-blue-200',
      labelColor: 'text-blue-700 dark:text-blue-300',
    },
    emerald: {
      accent: 'bg-emerald-500',
      bg: 'bg-linear-to-br from-emerald-50 to-emerald-50/40 dark:from-emerald-950/30 dark:to-emerald-950/10',
      valueColor: 'text-emerald-700 dark:text-emerald-200',
      labelColor: 'text-emerald-700 dark:text-emerald-300',
    },
    rose: {
      accent: 'bg-rose-500',
      bg: 'bg-linear-to-br from-rose-50 to-rose-50/40 dark:from-rose-950/30 dark:to-rose-950/10',
      valueColor: 'text-rose-700 dark:text-rose-200',
      labelColor: 'text-rose-700 dark:text-rose-300',
    },
  };
  const t = map[tint];
  return (
    <div
      className={`relative rounded-xl border border-slate-200 dark:border-slate-700 ${t.bg} overflow-hidden shadow-sm`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.accent}`} aria-hidden />
      <div className="pl-4 pr-4 py-3">
        <p
          className={`text-[10px] font-bold uppercase tracking-wider ${t.labelColor} mb-1`}
        >
          {label}
        </p>
        <p className={`text-2xl font-bold tabular-nums ${t.valueColor}`}>{value}</p>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
