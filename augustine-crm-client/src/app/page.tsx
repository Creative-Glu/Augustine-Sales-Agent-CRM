'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkSupabaseHealth } from '@/lib/supabaseClient';

export default function Home() {
  (async () => {
    const health = await checkSupabaseHealth();
    if (health.valid) {
      console.log('✅ Supabase connected successfully');
    } else {
      console.error('❌ Supabase connection failed:', health.error);
    }
  })();

  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return null;
}

