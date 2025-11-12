import { HomeIcon, ChartBarIcon, CubeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export const SIDEBAR_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/kra-dashboard', label: 'KRA Dashboard', icon: ChartBarIcon },
  { href: '/kpi-dashboard', label: 'KPI Dashboard', icon: ChartBarIcon },
  { href: '/products', label: 'Products', icon: CubeIcon },
  { href: '/icp', label: 'ICP', icon: UserGroupIcon },
  { href: '/offers', label: 'Offers', icon: CubeIcon },
  { href: '/campaigns', label: 'Campaigns', icon: ChartBarIcon },
  { href: '/leads', label: 'Leads', icon: UserGroupIcon },
];
