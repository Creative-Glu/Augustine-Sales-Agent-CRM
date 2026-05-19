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

      {/* Stage tiles — one per funnel stage */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
      >
        {funnelData.map((s, index) => {
          const color = STAGE_COLORS[s.stage] ?? '#94a3b8';
          const share = totalJourneys > 0 ? ((s.count / totalJourneys) * 100).toFixed(0) : '0';
          return (
            <motion.div
              key={s.stage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  {s.stage}
                </p>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.count}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{share}% of total</p>
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
          return (
            <div
              key={`${from}->${to}`}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                {from} → {to}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {rate(toCount, fromCount)}%
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

      {/* Summary footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
          <p className="text-[10px] font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">
            Overall conversion
          </p>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {overallConversionRate}%
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
            {wonCount} Closed-Won / {totalJourneys} journeys
          </p>
        </div>
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50">
          <p className="text-[10px] font-medium text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">
            Win rate (of closed)
          </p>
          <p className="text-lg font-bold text-green-900 dark:text-green-100">{winRate}%</p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
            {wonCount} won vs {lostCount} lost
          </p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
            Disqualified
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{disqualifiedCount}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {rate(disqualifiedCount, totalJourneys)}% of total
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
