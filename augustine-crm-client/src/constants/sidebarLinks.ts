import {
  HomeIcon,
  ChartBarIcon,
  CubeIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { TreePine, UserCheck2Icon } from 'lucide-react';

export const SIDEBAR_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/kpi-dashboard', label: 'KPI Dashboard', icon: ChartBarIcon },
  // {
  //   href: '/lead-tracking-dashboard',
  //   label: 'Lead Tracking Dashboard',
  //   icon: DocumentChartBarIcon,
  // },
  { href: '/products', label: 'Products', icon: CubeIcon },
  { href: '/icp', label: 'ICP', icon: Squares2X2Icon },
  { href: '/product-offers', label: 'Offers', icon: CubeIcon },
  { href: '/campaigns', label: 'Campaigns', icon: ChartBarIcon },
  // { href: '/leads', label: 'Leads', icon: UserGroupIcon },
  { href: '/journey', label: 'Journey', icon: TreePine },
  { href: '/profile', label: 'Profile', icon: UserCheck2Icon },
];
