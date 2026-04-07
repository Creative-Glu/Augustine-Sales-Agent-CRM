'use client';

import Sidebar from '@/components/Sidebar';
import '../globals.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-purplecrm-50 p-8">{children}</div>
    </>
  );
}

