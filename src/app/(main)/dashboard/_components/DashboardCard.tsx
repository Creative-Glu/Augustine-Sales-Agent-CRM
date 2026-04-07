'use client';

import { motion } from 'framer-motion';
import { ComponentType, SVGProps } from 'react';

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color?: string;
}

export default function DashboardCard({ title, value, subtitle, icon: Icon, color }: CardProps) {
  const iconVariants = {
    idle: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 5, transition: { duration: 0.3 } },
  };
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className={`card bg-gradient-to-br ${color} hover:brightness-110`}
    >
      {/* Inner content */}
      <div className="bg-card  text-card-foreground rounded-xl border border-border shadow-2xl p-6 flex flex-col justify-between h-full">
        {/* Top row: Icon + Value */}
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-gray-100 shadow-sm flex items-center justify-center">
            <motion.div
              variants={iconVariants}
              initial="idle"
              whileHover="hover"
              className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 shadow-md group-hover:shadow-lg transition-shadow duration-300 flex items-center justify-center"
            >
              <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </motion.div>
          </div>
          <p className="text-3xl font-bold">{value}</p>
        </div>

        {/* Bottom row: Title + Subtitle */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
}
