import { STORAGE_KEYS } from '../constants/storageKeys';

/**
 * Stored user shape — passwords are hashed, never stored in plaintext.
 * NOTE: For production, user credentials should be managed server-side only.
 * This local storage approach is a development/demo fallback.
 */
interface StoredUser {
  email: string;
  /** bcrypt or SHA-256 hash — never store plaintext passwords in the browser. */
  password: string;
  id: string;
  createdAt: string;
}

export function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}
