import {
  HomeIcon,
  ChartBarIcon,
  CubeIcon,
  UserGroupIcon,
  Squares2X2Icon,
  ChartBarSquareIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { TreePine, ActivityIcon, MailSearchIcon } from 'lucide-react';

export interface SidebarLink {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | React.ComponentType<{ className?: string }>;
}

export interface SidebarGroup {
  title: string;
  links: SidebarLink[];
}

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    title: 'Overview',
    links: [
      { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
      { href: '/kpi-dashboard', label: 'KPI Dashboard', icon: ChartBarIcon },
      { href: '/marketing-dashboard', label: 'Marketing', icon: ChartBarIcon },
    ],
  },
  {
    title: 'Sales Pipeline',
    links: [
      { href: '/products', label: 'Products', icon: CubeIcon },
      { href: '/icp', label: 'ICP', icon: Squares2X2Icon },
      { href: '/product-offers', label: 'Offers', icon: TagIcon },
      { href: '/campaigns', label: 'Campaigns', icon: ChartBarIcon },
      { href: '/contacts', label: 'Contacts', icon: UserGroupIcon },
      { href: '/journey', label: 'Journey', icon: TreePine },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/execution-dashboard', label: 'Execution', icon: ChartBarSquareIcon },
      { href: '/csv-merge', label: 'Dry Run Tool', icon: DocumentDuplicateIcon },
      { href: '/marketing-jobs', label: 'Scrape Jobs', icon: ActivityIcon },
      { href: '/outreach', label: 'Outreach', icon: MailSearchIcon },
    ],
  },
  {
    title: 'Admin',
    links: [
      { href: '/roles', label: 'Role Mapping', icon: ShieldCheckIcon },
      { href: '/admin-users', label: 'Users', icon: UserGroupIcon },
    ],
  },
];

/** Flat list for backward compatibility. */
export const SIDEBAR_LINKS = SIDEBAR_GROUPS.flatMap((g) => g.links);
