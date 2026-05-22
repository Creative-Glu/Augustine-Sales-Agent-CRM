'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, Info } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { APP_VERSION } from '@/constants/login';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);

    if (!result.success) {
      toast({
        title: 'Login failed',
        description: result.error ?? 'Invalid email or password',
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Login successful', description: 'Welcome back!' });
    router.push('/execution-dashboard');
  };

  return (
    <section className="flex flex-col">
      {/* Mobile-only brand strip */}
      <div
        className="lg:hidden px-6 py-8 flex flex-col items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, #020617 0%, #1e3a8a 100%)',
        }}
      >
        <Image
          src="/augustine-logo.png"
          alt="Augustine Institute"
          width={280}
          height={67}
          className="h-12 w-auto object-contain"
          priority
          quality={100}
        />
        <p className="text-xs font-medium tracking-wide text-blue-200">
          Lead Gen &amp; Outreach Operations
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10 lg:py-12">
        <div className="w-full" style={{ maxWidth: '28rem' }}>
          <header className="mb-6 space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500">
              Sign in to continue managing your outreach campaigns.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@augustineinstitute.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
                <Info className="h-3 w-3 mt-0.5 shrink-0" />
                Use the email address provided by your administrator.
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                {/* <button
                  type="button"
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
                  onClick={() =>
                    toast({
                      title: 'Need help signing in?',
                      description: 'Contact your workspace admin to reset your password.',
                    })
                  }
                >
                  Forgot password?
                </button> */}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute cursor-pointer inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
                <ShieldCheck className="h-3 w-3 mt-0.5 shrink-0 text-emerald-500" />
                Your session is secured with token-based authentication.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full text-white font-semibold"
              style={{
                background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Helpful hint card */}
          <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
            <p className="text-xs font-semibold text-blue-900">First time here?</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-blue-800/80">
              Access is invite-only. If you don&apos;t have credentials yet, ask your administrator
              to add you in the Roles section.
            </p>
          </div>

          <div className="mt-6 text-center space-y-1">
            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} Augustine Institute. All rights reserved.
            </p>
            <p className="text-[10px] text-slate-400">Build {APP_VERSION} · Secure connection</p>
          </div>
        </div>
      </div>
    </section>
  );
}
