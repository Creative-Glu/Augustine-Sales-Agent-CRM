'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
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

    toast({
      title: 'Login successful',
      description: 'Welcome back!',
    });

    router.push('/marketing-dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-75pace-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Augustine</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Lead Gen &amp; Outreach Operations
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl border border-border shadow-sm px-6 py-7 space-y-5"
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
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
            className="mt-2 flex items-center justify-center gap-2 text-slate-400 text-xs"
          >
            <div className="h-px w-8 bg-linear-to-r from-transparent to-slate-600" />
            <span>JWT-secured backend authentication</span>
            <div className="h-px w-8 bg-linear-to-l from-transparent to-slate-600" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

