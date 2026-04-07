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
import { ArrowDownRightIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function JourneyFunnelChart({ counts }: { counts?: number[] }) {
  const { data, isLoading } = useDashboardAnalytics();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className=" dark:bg-slate-900  duration-300"
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

  let outreached = 0;
  let engaged = 0;
  let mql = 0;

  if (counts && counts.length >= 3) {
    [outreached, engaged, mql] = counts;
  } else if (totalJourneys > 0) {
    outreached = Math.round(totalJourneys * 0.6);
    engaged = Math.round(totalJourneys * 0.3);
    mql = Math.max(0, totalJourneys - outreached - engaged);
  } else {
    outreached = 120;
    engaged = 45;
    mql = 12;
  }

  // Calculate conversion rates
  const outreachedToEngagedRate = outreached > 0 ? ((engaged / outreached) * 100).toFixed(1) : 0;
  const engagedToMQLRate = engaged > 0 ? ((mql / engaged) * 100).toFixed(1) : 0;

  const labels = ['Outreached', 'Engaged', 'MQL'];

  const primary = '#3b82f6'; // Blue
  const chart2 = '#06b6d4'; // Cyan
  const success = '#10b981'; // Green

  const dataChart = {
    labels,
    datasets: [
      {
        label: 'Count',
        data: [outreached, engaged, mql],
        backgroundColor: [primary, chart2, success],
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: ['#2563eb', '#0891b2', '#059669'],
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className=" dark:bg-slate-900  duration-300 "
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
          Track conversion rates across your sales funnel stages
        </p>
        <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-4" />
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        {[
          {
            label: 'Total Outreached',
            value: outreached,
            color: 'blue',
            icon: ArrowDownRightIcon,
          },
          {
            label: 'Engaged',
            value: engaged,
            color: 'cyan',
            icon: ArrowUpRightIcon,
          },
          {
            label: 'MQL',
            value: mql,
            color: 'green',
            icon: ArrowUpRightIcon,
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`p-4 rounded-xl bg-gradient-to-br ${
              stat.color === 'blue'
                ? 'from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950'
                : stat.color === 'cyan'
                  ? 'from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950'
                  : 'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950'
            } border ${
              stat.color === 'blue'
                ? 'border-blue-200 dark:border-blue-800'
                : stat.color === 'cyan'
                  ? 'border-cyan-200 dark:border-cyan-800'
                  : 'border-green-200 dark:border-green-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {stat.label}
              </p>
              <stat.icon
                className={`w-4 h-4 ${
                  stat.color === 'blue'
                    ? 'text-blue-600 dark:text-blue-400'
                    : stat.color === 'cyan'
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-green-600 dark:text-green-400'
                }`}
              />
            </div>
            <p
              className={`text-2xl font-bold ${
                stat.color === 'blue'
                  ? 'text-blue-600 dark:text-blue-400'
                  : stat.color === 'cyan'
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-green-600 dark:text-green-400'
              }`}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Conversion Rates */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        {[
          {
            label: 'Outreached → Engaged',
            rate: outreachedToEngagedRate,
          },
          {
            label: 'Engaged → MQL',
            rate: engagedToMQLRate,
          },
        ].map((conversion, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              {conversion.label}
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{conversion.rate}%</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br  from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <div style={{ height: '350px' }}>
          <Bar data={dataChart} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50"
      >
        <p className="text-xs text-blue-900 dark:text-blue-200 font-medium">
          💡{' '}
          <span className="ml-2">
            Total funnel conversion:{' '}
            {totalJourneys > 0 ? ((mql / totalJourneys) * 100).toFixed(1) : 0}% of total journeys
            reached MQL stage
          </span>
        </p>
      </motion.div>
    </motion.div>
  );
}
