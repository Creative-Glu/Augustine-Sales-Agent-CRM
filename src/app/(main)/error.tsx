'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to an error reporting service
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">This page encountered an error</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Something went wrong loading this section. Your other pages are unaffected.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} variant="default" size="sm" className="gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            Retry
          </Button>
          <Button onClick={() => (window.location.href = '/dashboard')} variant="outline" size="sm" className="gap-2">
            <HomeIcon className="w-4 h-4" />
            Dashboard
          </Button>
        </div>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
