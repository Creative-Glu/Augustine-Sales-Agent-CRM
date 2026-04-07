'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
import { CHART_COLORS, FOOTER_STATS } from '@/constants/chartColors';
import { calculateFooterStats } from '@/utils/chartUtils';

interface FunnelStageChartProps {
  data: {
    stage: string;
    leadsReached: number;
    stageOccurrences: number;
    avgHours: number;
  }[];
  title?: string;
  subtitle?: string;
}

// Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700"
    >
      <p className="font-semibold mb-2 text-slate-900 dark:text-white">{label}</p>

      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{entry.value}</span>
        </div>
      ))}
    </motion.div>
  );
};

const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap gap-6 justify-center mt-6">
    {payload.map((entry: any) => (
      <div key={entry.value} className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-sm">{entry.value}</span>
      </div>
    ))}
  </div>
);

export const FunnelStageChart = ({
  data,
  title = 'Funnel Stage Performance',
  subtitle = 'Track leads, occurrences, and time across each stage',
}: FunnelStageChartProps) => {
  const footerStats = calculateFooterStats(data, FOOTER_STATS);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={430}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />

            <XAxis dataKey="stage" angle={-45} textAnchor="end" height={70} stroke="#94a3b8" />

            <YAxis stroke="#94a3b8" />

            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />

            {/* Bars */}
            <Bar
              dataKey="leadsReached"
              name="Leads Reached"
              fill="url(#colorLeads)"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="stageOccurrences"
              name="Stage Occurrences"
              fill="url(#colorOccurrences)"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="avgHours"
              name="Avg Hours"
              fill="url(#colorHours)"
              radius={[8, 8, 0, 0]}
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.leads.start} />
                <stop offset="95%" stopColor={CHART_COLORS.leads.end} />
              </linearGradient>

              <linearGradient id="colorOccurrences" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.occurrences.start} />
                <stop offset="95%" stopColor={CHART_COLORS.occurrences.end} />
              </linearGradient>

              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.hours.start} />
                <stop offset="95%" stopColor={CHART_COLORS.hours.end} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>

        {/* Footer Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {footerStats.map((stat) => (
            <div
              key={stat.label}
              className={`p-4 rounded-lg border 
                ${
                  stat.color === 'blue'
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                    : stat.color === 'green'
                      ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                      : 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
                }`}
            >
              <p className="text-xs uppercase text-slate-600 dark:text-slate-300">{stat.label}</p>
              <p
                className={`text-2xl font-bold mt-5 ${
                  stat.color === 'blue'
                    ? 'text-blue-600 dark:text-blue-400'
                    : stat.color === 'green'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                }`}
              >
                {stat.value}
                {stat.suffix}
              </p>
              ;
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
