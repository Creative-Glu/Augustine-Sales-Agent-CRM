'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function Home() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  console.log('isSignedIn', isSignedIn, user);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isLoaded, isSignedIn, router, user]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
}
