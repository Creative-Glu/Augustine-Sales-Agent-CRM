'use client';

import Sidebar from '@/components/Sidebar';
import UserBadge from '@/components/UserBadge';
import '../globals.css';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';

// Routes that get the "polish" treatment (focus rings, animations, etc.).
// Admin and Tools routes are intentionally excluded.
const OTHERS_ROUTE_PREFIXES = [
  '/dashboard',
  '/campaigns',
  '/products',
  '/product-offers',
  '/icp',
  '/contacts',
  '/journey',
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing) return;
    if (!accessToken) {
      router.replace('/login');
    }
  }, [accessToken, isInitializing, router]);

  if (!accessToken) {
    return null;
  }

  const isOthersRoute = OTHERS_ROUTE_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  return (
    <>
      <Sidebar />
      <div
        className={`ml-64 min-h-screen bg-slate-50 dark:bg-slate-950 p-8 ${isOthersRoute ? 'polish-others' : ''}`}
      >
        {/* Top-right user badge — replaces the user info that used to live
            in the sidebar footer. Sticky so it stays visible while scrolling. */}

        {children}
      </div>
    </>
  );
}
