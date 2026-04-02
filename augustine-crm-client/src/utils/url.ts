// ─── URL sanitization utilities ────────────────────────────────────────────
// Prevents XSS via javascript: and data: URI injection in href/src attributes.

/** Dangerous URI schemes that must never appear in user-facing links. */
const BLOCKED_SCHEMES = /^(javascript|data|vbscript|file):/i;

/**
 * Sanitize a URL for use in href attributes.
 * - Blocks javascript:, data:, vbscript:, file: schemes
 * - Returns '#' for blocked or empty URLs
 * - Prepends https:// if no protocol is present
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (!trimmed) return '#';
  if (BLOCKED_SCHEMES.test(trimmed)) return '#';
  // Protocol-relative URLs (//evil.com) — block them
  if (trimmed.startsWith('//')) return '#';
  // Prepend https:// if missing
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('mailto:')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Check if a string looks like a valid URL (has protocol or domain-like structure).
 */
export function looksLikeUrl(value: string): boolean {
  if (!value) return false;
  const t = value.trim();
  return t.startsWith('http://') || t.startsWith('https://') || (t.includes('.') && !t.includes(' '));
}
