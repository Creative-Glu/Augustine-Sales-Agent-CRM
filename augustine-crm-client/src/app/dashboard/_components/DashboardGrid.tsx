'use client';

import { useDashboardStats } from '@/src/services/states/useDashboardStats';
import DashboardCard from './DashboardCard';
import { CubeIcon, ChartBarIcon, UserGroupIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';

export default function DashboardGrid() {
  const { data, isLoading, isError } = useDashboardStats();

  if (isError) return <div className="p-6 text-red-600">Error loading stats</div>;

  const stats = [
    {
      title: 'Products',
      value: data?.products ?? 0,
      subtitle: 'Active SKUs',
      icon: CubeIcon,
      color: 'from-purplecrm-400 to-purplecrm-600',
    },
    {
      title: 'Journeys',
      value: data?.journeys ?? 0,
      subtitle: 'Total Journeys',
      icon: ChartBarIcon,
      color: 'from-green-400 to-emerald-600',
    },
    {
      title: 'ICPs',
      value: data?.icps ?? 0,
      subtitle: 'Ideal Profiles',
      icon: UserGroupIcon,
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Campaigns',
      value: data?.campaigns ?? 0,
      subtitle: 'Live Campaigns',
      icon: RocketLaunchIcon,
      color: 'from-pink-400 to-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <DashboardCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
