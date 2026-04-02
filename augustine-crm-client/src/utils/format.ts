// ─── Centralized formatting utilities ──────────────────────────────────────
// Every component should import from here instead of defining local versions.

export function formatPrice(
  price: string | number | null | undefined,
  pricingType?: string | null
): string {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price));
}

/**
 * Format an ISO date string to a short human-readable form.
 * Returns 'N/A' for falsy inputs, '—' for null (use in tables).
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Format an ISO date string to locale date + time (e.g. "4/2/2026, 3:45:12 PM").
 * Use in execution dashboard tables where time matters.
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso ?? '—';
  }
}

/**
 * Format an ISO date string to short date + short time (e.g. "4/2/26, 3:45 PM").
 * Compact variant for tighter table columns.
 */
export function formatDateTimeShort(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso ?? '—';
  }
}

/**
 * Format an ISO date as a relative time string (e.g. "in 5m", "overdue").
 * Useful for next-retry-at or scheduled timestamps.
 */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = d.getTime() - now;
    if (diff < 0) return 'overdue';
    if (diff < 60_000) return 'in <1m';
    if (diff < 3600_000) return `in ${Math.floor(diff / 60_000)}m`;
    if (diff < 86400_000) return `in ${Math.floor(diff / 3600_000)}h`;
    return d.toLocaleDateString();
  } catch {
    return iso ?? '—';
  }
}

/** Truncate a string with an ellipsis. */
export function truncate(str: string | null | undefined, max = 120): string {
  if (!str) return '—';
  const t = str.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

/** Display a cell value, falling back to '—' for null/undefined/empty. */
export function cellValue(value: string | null | undefined): string {
  return value?.trim() || '—';
}
