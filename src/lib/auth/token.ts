/**
 * Generate a cryptographically secure random token.
 * Uses crypto.getRandomValues() instead of Math.random().
 */
export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
