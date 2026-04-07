import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AuthUser } from '@/providers/AuthProvider';

// ─── Mock Auth Context ─────────────────────────────────────────────────────

export const mockUser: AuthUser = {
  id: 1,
  email: 'admin@augustine.org',
  full_name: 'Test Admin',
  role: 'Admin',
};

export const mockLogin = vi.fn().mockResolvedValue({ success: true });
export const mockLogout = vi.fn();

// We mock the entire AuthProvider module so useAuth returns test data
vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: mockUser,
    accessToken: 'test-token-123',
    isInitializing: false,
    login: mockLogin,
    logout: mockLogout,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ─── Test QueryClient ──────────────────────────────────────────────────────

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

// ─── Custom render with providers ──────────────────────────────────────────

function AllProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { render };
