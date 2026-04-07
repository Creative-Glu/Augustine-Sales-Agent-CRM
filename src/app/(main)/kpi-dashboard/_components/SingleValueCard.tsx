'use client';

import { CARD_COLOR_VARIANTS, CardColor } from '@/constants/kpi-dashboard';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SingleValueCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon?: ReactNode;
  color?: CardColor;
  trend?: 'up' | 'down' | 'neutral';
  animated?: boolean;
}

export const SingleValueCard = ({
  title,
  value,
  suffix,
  icon,
  color = 'blue',
  trend = 'neutral',
  animated = true,
}: SingleValueCardProps) => {
  const colors = CARD_COLOR_VARIANTS[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={animated ? { y: -4 } : {}}
      transition={{ duration: 0.3 }}
      className="group h-full"
    >
      <div
        className={`relative h-full bg-gradient-to-br ${colors.bg} rounded-2xl p-0.5 overflow-hidden border`}
      >
        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Inner Card */}
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 h-full flex flex-col justify-between border border-slate-200/50 dark:border-slate-700/50 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {title}
            </p>

            {icon && (
              <motion.div
                whileHover={animated ? { scale: 1.1, rotate: 5 } : {}}
                transition={{ duration: 0.3 }}
                className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${colors.accent}`}
              >
                {icon}
              </motion.div>
            )}
          </div>

          {/* Value */}
          <div className="space-y-3">
            <motion.div whileHover={animated ? { scale: 1.05 } : {}}>
              <div className="flex items-baseline gap-2">
                <p
                  className={`text-5xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}
                >
                  {value}
                </p>
                {suffix && (
                  <span className={`text-lg font-semibold ${colors.accent}`}>{suffix}</span>
                )}
              </div>
            </motion.div>

            {/* Trend */}
            {trend !== 'neutral' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  trend === 'up'
                    ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                }`}
              >
                <span>{trend === 'up' ? '↑' : '↓'}</span>
                <span>{trend === 'up' ? 'Increasing' : 'Decreasing'}</span>
              </motion.div>
            )}
          </div>

          {/* Accent Line */}
          <div
            className={`h-1 w-12 bg-gradient-to-r ${colors.line} rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          />
        </div>
      </div>
    </motion.div>
  );
};
