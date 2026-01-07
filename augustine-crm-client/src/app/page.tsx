'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { checkSupabaseHealth } from '@/lib/supabaseClient';

export default function Home() {
  // Call this once on app start (e.g., layout.tsx, server startup, or API init)
  (async () => {
    const health = await checkSupabaseHealth();

    if (health.valid) {
      console.log('✅ Supabase connected successfully');
    } else {
      console.error('❌ Supabase connection failed:', health.error);
    }
  })();

  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  console.log('isSignedIn', isSignedIn, user);

  useEffect(() => {
    // if (!isLoaded) return;
    router.replace('/dashboard');

    // if (isSignedIn) {
    //   router.replace('/dashboard');
    // } else {
    // router.replace('/login');
    // }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
}
