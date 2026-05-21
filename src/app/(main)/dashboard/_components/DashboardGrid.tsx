'use client';

import { useDashboardAnalytics } from '@/services/analytics/useDashboardAnalytics';
import DashboardCard, { type CardTint } from './DashboardCard';
import DashboardCardSkeleton from './DashboardCardSkeleton';
import {
  CubeIcon,
  ChartBarIcon,
  UserGroupIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/solid';
import { AlertCircle } from 'lucide-react';

interface StatConfig {
  title: string;
  key: 'products' | 'journeys' | 'icps' | 'campaigns';
  subtitle: string;
  icon: typeof CubeIcon;
  tint: CardTint;
  href: string;
}

const STATS: StatConfig[] = [
  {
    title: 'Products',
    key: 'products',
    subtitle: 'Active SKUs',
    icon: CubeIcon,
    tint: 'blue',
    href: '/products',
  },
  {
    title: 'Journeys',
    key: 'journeys',
    subtitle: 'Total journeys',
    icon: ChartBarIcon,
    tint: 'emerald',
    href: '/journey',
  },
  {
    title: 'ICPs',
    key: 'icps',
    subtitle: 'Ideal profiles',
    icon: UserGroupIcon,
    tint: 'amber',
    href: '/icp',
  },
  {
    title: 'Campaigns',
    key: 'campaigns',
    subtitle: 'Live campaigns',
    icon: RocketLaunchIcon,
    tint: 'violet',
    href: '/campaigns',
  },
];

export default function DashboardGrid() {
  const { data, isLoading, isError, refetch } = useDashboardAnalytics();

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-5 flex flex-col items-center text-center gap-1.5">
        <AlertCircle className="w-5 h-5 text-rose-600" />
        <p className="text-sm font-semibold text-rose-800">Couldn&apos;t load stats</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-xs font-medium text-rose-700 hover:text-rose-900 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat) => (
        <DashboardCard
          key={stat.title}
          title={stat.title}
          value={data?.[stat.key] ?? 0}
          subtitle={stat.subtitle}
          icon={stat.icon}
          tint={stat.tint}
          href={stat.href}
        />
      ))}
    </div>
  );
}
