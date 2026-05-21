'use client';

import Sidebar from '@/components/Sidebar';
import '../globals.css';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

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
        className={`ml-64 min-h-screen bg-purplecrm-50 p-8 ${isOthersRoute ? 'polish-others' : ''}`}
      >
        {/* {isOthersRoute && (
          <div className="fixed top-4 right-4 z-40">
            <ThemeToggle />
          </div>
        )} */}
        {children}
      </div>
    </>
  );
}
