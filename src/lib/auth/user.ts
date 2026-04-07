import { getStoredUsers, saveUsers } from './storage';
import { generateToken } from './token';

export async function signUp(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email || !password) return { success: false, error: 'Email and password are required' };

    if (password.length < 6)
      return { success: false, error: 'Password must be at least 6 characters' };

    const users = getStoredUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
      return { success: false, error: 'User already exists' };

    const newUser = {
      id: generateToken(),
      email: email.toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to sign up' };
  }
}
