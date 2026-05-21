'use client';

import { motion } from 'framer-motion';
import { ComponentType, SVGProps } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';

export type CardTint = 'blue' | 'emerald' | 'amber' | 'violet' | 'rose' | 'indigo';

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tint?: CardTint;
  href?: string;
}

const TINTS: Record<CardTint, {
  accentBar: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  hoverShadow: string;
  hoverBorder: string;
}> = {
  blue: {
    accentBar: 'bg-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-700',
    hoverShadow: 'group-hover:shadow-blue-200/60',
    hoverBorder: 'group-hover:border-blue-300',
  },
  emerald: {
    accentBar: 'bg-emerald-500',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-700',
    hoverShadow: 'group-hover:shadow-emerald-200/60',
    hoverBorder: 'group-hover:border-emerald-300',
  },
  amber: {
    accentBar: 'bg-amber-500',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    valueColor: 'text-amber-700',
    hoverShadow: 'group-hover:shadow-amber-200/60',
    hoverBorder: 'group-hover:border-amber-300',
  },
  violet: {
    accentBar: 'bg-violet-500',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    valueColor: 'text-violet-700',
    hoverShadow: 'group-hover:shadow-violet-200/60',
    hoverBorder: 'group-hover:border-violet-300',
  },
  rose: {
    accentBar: 'bg-rose-500',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    valueColor: 'text-rose-700',
    hoverShadow: 'group-hover:shadow-rose-200/60',
    hoverBorder: 'group-hover:border-rose-300',
  },
  indigo: {
    accentBar: 'bg-indigo-500',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    valueColor: 'text-indigo-700',
    hoverShadow: 'group-hover:shadow-indigo-200/60',
    hoverBorder: 'group-hover:border-indigo-300',
  },
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tint = 'blue',
  href,
}: CardProps) {
  const t = TINTS[tint];

  const inner = (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`group relative bg-white dark:bg-slate-900 text-card-foreground rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg ${t.hoverShadow} ${t.hoverBorder} transition-all duration-200 overflow-hidden`}
    >
      {/* Left accent bar — color identifier */}
      <div
        aria-hidden
        className={`absolute left-0 top-0 bottom-0 w-1 ${t.accentBar}`}
      />

      <div className="pl-4 pr-5 py-5 flex flex-col h-full min-h-30">
        {/* Top row: icon tile + arrow */}
        <div className="flex items-start justify-between mb-3">
          <span
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${t.iconBg} ${t.iconColor} shadow-sm`}
          >
            <Icon className="w-5 h-5" />
          </span>
          {href && (
            <ArrowUpRight
              className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
              aria-hidden
            />
          )}
        </div>

        {/* Value — large, bold, tinted */}
        <p
          className={`text-3xl font-bold tabular-nums leading-none ${t.valueColor} dark:text-white`}
        >
          {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
        </p>

        {/* Title + subtitle */}
        <div className="mt-3">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="block focus:outline-none">
        {inner}
      </a>
    );
  }
  return inner;
}
