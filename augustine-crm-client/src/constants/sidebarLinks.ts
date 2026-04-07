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
  EllipsisHorizontalCircleIcon,
} from '@heroicons/react/24/outline';
import { TreePine, ActivityIcon, MailSearchIcon } from 'lucide-react';

export interface SidebarLink {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface SidebarGroup {
  title: string;
  links: SidebarLink[];
  collapsible?: boolean;
  collapsibleIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>> | React.ComponentType<{ className?: string }>;
}

export const SIDEBAR_GROUPS: SidebarGroup[] = [
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
  {
    title: 'Others',
    collapsible: true,
    collapsibleIcon: EllipsisHorizontalCircleIcon,
    links: [
      { href: '/dashboard', label: 'Dashboard', icon: HomeIcon, disabled: true },
      { href: '/kpi-dashboard', label: 'KPI Dashboard', icon: ChartBarIcon, disabled: true },
      { href: '/marketing-dashboard', label: 'Marketing', icon: ChartBarIcon, disabled: true },
      { href: '/products', label: 'Products', icon: CubeIcon, disabled: true },
      { href: '/icp', label: 'ICP', icon: Squares2X2Icon, disabled: true },
      { href: '/product-offers', label: 'Offers', icon: TagIcon, disabled: true },
      { href: '/campaigns', label: 'Campaigns', icon: ChartBarIcon, disabled: true },
      { href: '/contacts', label: 'Contacts', icon: UserGroupIcon, disabled: true },
      { href: '/journey', label: 'Journey', icon: TreePine, disabled: true },
    ],
  },
];

/** Flat list for backward compatibility. */
export const SIDEBAR_LINKS = SIDEBAR_GROUPS.flatMap((g) => g.links);
