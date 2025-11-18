import Cookies from 'js-cookie';
import { COOKIE_KEYS } from '../constants/cookieKeys';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { getStoredUsers } from './storage';
import { generateToken } from './token';
import { AuthSession, User } from '@/types/auth';

export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; session?: AuthSession }> {
  try {
    if (!email || !password) return { success: false, error: 'Email and password are required' };

    const users = getStoredUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) return { success: false, error: 'Invalid email or password' };

    const dummyAuthToken = `dummy-${generateToken()}`;
    const session: AuthSession = {
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
      token: dummyAuthToken,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    // ✅ Store session & token in cookies
    Cookies.set(STORAGE_KEYS.SESSION, JSON.stringify(session), {
      expires: 7,
      sameSite: 'Lax',
    });

    Cookies.set(COOKIE_KEYS.AUTH_TOKEN, dummyAuthToken, {
      expires: 7,
      sameSite: 'Lax',
    });

    return { success: true, session };
  } catch (error) {
    console.error('signIn error:', error);
    return { success: false, error: 'Failed to sign in' };
  }
}

export function signOut(): void {
  Cookies.remove(STORAGE_KEYS.SESSION);
  Cookies.remove(COOKIE_KEYS.AUTH_TOKEN);
}

export function getSession(): AuthSession | null {
  try {
    const stored = Cookies.get(STORAGE_KEYS.SESSION);
    if (!stored) return null;

    const session: AuthSession = JSON.parse(stored);
    if (session.expiresAt < Date.now()) {
      signOut();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function getCurrentUser(): User | null {
  const session = getSession();
  return session?.user ?? null;
}

export function isAuthenticated(): boolean {
  return !!getSession();
}
