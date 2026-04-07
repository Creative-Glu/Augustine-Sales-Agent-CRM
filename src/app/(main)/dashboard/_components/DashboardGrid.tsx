'use client';

import { useDashboardAnalytics } from '@/services/analytics/useDashboardAnalytics';
import DashboardCard from './DashboardCard';
import { CubeIcon, ChartBarIcon, UserGroupIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';

export default function DashboardGrid() {
  const { data, isLoading, isError } = useDashboardAnalytics();

  if (isError) return <div className="p-6 text-red-600">Error loading stats</div>;

  const stats = [
    {
      title: 'Products',
      value: data?.products ?? 0,
      subtitle: 'Active SKUs',
      icon: CubeIcon,
      color: 'from-chart-2 to-chart-3', // Tailwind gradient
    },
    {
      title: 'Journeys',
      value: data?.journeys ?? 0,
      subtitle: 'Total Journeys',
      icon: ChartBarIcon,
      color: 'from-[var(--chart-2)] to-[var(--chart-3)]',
    },
    {
      title: 'ICPs',
      value: data?.icps ?? 0,
      subtitle: 'Ideal Profiles',
      icon: UserGroupIcon,
      color: 'from-chart-2 to-chart-3', // Tailwind gradient
    },
    {
      title: 'Campaigns',
      value: data?.campaigns ?? 0,
      subtitle: 'Live Campaigns',
      icon: RocketLaunchIcon,
      color: 'from-chart-2 to-chart-3', // Tailwind gradient
    },
  ];

  return (
    <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <DashboardCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
