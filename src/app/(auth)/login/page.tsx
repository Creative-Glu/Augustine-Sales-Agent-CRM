'use client';

import { BrandPanel } from './_components/BrandPanel';
import { LoginForm } from './_components/LoginForm';

export default function LoginPage() {
  return (
    <div
      className="min-h-screen w-full bg-slate-50 grid grid-cols-1 lg:grid-cols-2"
      style={{ width: '100%' }}
    >
      <BrandPanel />
      <LoginForm />
    </div>
  );
}
