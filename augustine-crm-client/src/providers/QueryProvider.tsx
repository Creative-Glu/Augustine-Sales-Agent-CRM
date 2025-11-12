'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * React Query provider that wraps the application
 * Initializes a single QueryClient instance and provides it to all components
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // Create a QueryClient only once (per mount)
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
