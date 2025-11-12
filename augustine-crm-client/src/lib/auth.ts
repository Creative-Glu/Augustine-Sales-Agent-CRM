export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

// Storage keys
const STORAGE_KEY = 'augustine-auth-session';
const USERS_KEY = 'augustine-users';

/**
 * Get stored users from localStorage
 */
function getStoredUsers(): Array<{
  email: string;
  password: string;
  id: string;
  createdAt: string;
}> {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save users to localStorage
 */
function saveUsers(
  users: Array<{ email: string; password: string; id: string; createdAt: string }>
): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Generate a simple token
 */
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Check if user already exists
    const users = getStoredUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Create new user
    const newUser = {
      id: generateToken(),
      email: email.toLowerCase(),
      password: password, // In production, hash this!
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to create account' };
  }
}

/**
 * Sign in a user
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; session?: AuthSession }> {
  try {
    // Validate input
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Find user
    const users = getStoredUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Create session
    const session: AuthSession = {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      token: generateToken(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Save session
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }

    return { success: true, session };
  } catch (error) {
    return { success: false, error: 'Failed to sign in' };
  }
}

/**
 * Sign out current user
 */
export function signOut(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Get current session
 */
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const session: AuthSession = JSON.parse(stored);

    // Check if session expired
    if (session.expiresAt < Date.now()) {
      signOut();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  const session = getSession();
  return session?.user ?? null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Check authentication status (for React hooks)
 */
export function checkAuth(): { authenticated: boolean; user: User | null } {
  const session = getSession();
  return {
    authenticated: session !== null,
    user: session?.user ?? null,
  };
}
