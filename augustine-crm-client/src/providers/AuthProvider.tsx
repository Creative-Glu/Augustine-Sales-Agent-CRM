'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type UserRole = 'Admin' | 'Reviewer' | 'Viewer';

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY_TOKEN = 'augustine-access-token';
const STORAGE_KEY_USER = 'augustine-auth-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialise = async () => {
      try {
        const storedToken =
          typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY_TOKEN) : null;
        const storedUser =
          typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY_USER) : null;

        if (!storedToken) {
          return;
        }

        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
        if (!base) {
          // Fall back to stored user if base URL missing
          if (storedUser) {
            setAccessToken(storedToken);
            setUser(JSON.parse(storedUser) as AuthUser);
          }
          return;
        }

        const res = await fetch(`${base}/api/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (!res.ok) {
          // Token invalid or expired
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(STORAGE_KEY_TOKEN);
            window.localStorage.removeItem(STORAGE_KEY_USER);
          }
          setAccessToken(null);
          setUser(null);
          return;
        }

        const data = await res.json();
        const authUser: AuthUser = {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role as UserRole,
        };

        setAccessToken(storedToken);
        setUser(authUser);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authUser));
        }
      } catch {
        // ignore and treat as logged out
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initialise();
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY_TOKEN);
      window.localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
        if (!base) {
          return { success: false, error: 'API base URL is not configured' };
        }
        const res = await fetch(`${base}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const detail =
            (body && (body.detail || body.error || body.message)) || 'Invalid email or password';
          return { success: false, error: String(detail) };
        }

        const data = await res.json();
        const token: string | undefined = data.access_token;
        if (!token) {
          return { success: false, error: 'Invalid login response from server' };
        }

        const authUser: AuthUser = {
          id: data.user_id,
          email: data.email,
          full_name: data.full_name,
          role: data.role as UserRole,
        };

        setAccessToken(token);
        setUser(authUser);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY_TOKEN, token);
          window.localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authUser));
        }

        return { success: true };
      } catch (e) {
        return {
          success: false,
          error: e instanceof Error ? e.message : 'Unable to login. Please try again.',
        };
      }
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isInitializing,
      login,
      logout,
    }),
    [user, accessToken, isInitializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

