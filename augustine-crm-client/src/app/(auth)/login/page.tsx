'use client';

import { useState } from 'react';
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
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
      </div>
    </div>
  );
}
