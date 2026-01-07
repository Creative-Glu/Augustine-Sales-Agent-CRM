'use client';

import { useEffect, useState } from 'react';
import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, []);

  const [checkingAuth, setCheckingAuth] = useState(false);

  if (checkingAuth) {
    return (
      <div className="min-h-screen  justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-700 mb-2">Augustine</h1>
          <p className="text-gray-600">Sales & Leads Dashboard</p>
        </div>

        <SignIn
          redirectUrl="/dashboard" // <-- Redirect after successful login
        />

        <p className="mt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Augustine CRM. All rights reserved.
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs"
          >
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-600" />
            <span>Secure Authentication</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-600" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
