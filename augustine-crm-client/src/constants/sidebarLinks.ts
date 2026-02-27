import {
  HomeIcon,
  ChartBarIcon,
  CubeIcon,
  UserGroupIcon,
  Squares2X2Icon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline';
import { TreePine, ActivityIcon, MailSearchIcon } from 'lucide-react';

export const SIDEBAR_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/kpi-dashboard', label: 'KPI Dashboard', icon: ChartBarIcon },
  // {
  //   href: '/lead-tracking-dashboard',
  //   label: 'Lead Tracking Dashboard',
  //   icon: DocumentChartBarIcon,
  // },
  { href: '/products', label: 'Products', icon: CubeIcon },
  { href: '/marketing-icp', label: 'ICP', icon: Squares2X2Icon },
  { href: '/product-offers', label: 'Offers', icon: CubeIcon },
  { href: '/marketing-campaigns', label: 'Campaigns', icon: ChartBarIcon },
  { href: '/contacts', label: 'Contacts', icon: UserGroupIcon },
  // { href: '/leads', label: 'Leads', icon: UserGroupIcon },
  { href: '/journey', label: 'Journey', icon: TreePine },
  // { href: '/upload-catholic-pdf', label: 'Upload Catholic PDF', icon: DocumentArrowUpIcon },
  { href: '/execution-dashboard', label: 'Execution Dashboard', icon: ChartBarSquareIcon },
  { href: '/marketing-dashboard', label: 'Marketing Dashboard', icon: ChartBarIcon },
  { href: '/marketing-jobs', label: 'Scrape Jobs', icon: ActivityIcon },
  { href: '/outreach', label: 'Outreach Approval', icon: ChartBarIcon },
  { href: '/admin-users', label: 'User Management', icon: UserGroupIcon },
];
