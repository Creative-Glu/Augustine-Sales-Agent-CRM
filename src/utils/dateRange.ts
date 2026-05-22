/**
 * Date-range helpers shared across modules.
 * Pure functions only — no React, no Calendly-specific logic.
 */

export type DateRangePreset =
  | 'none'
  | 'today'
  | 'tomorrow'
  | 'this-week'
  | 'next-week'
  | 'this-month'
  | 'last-7d'
  | 'last-30d'
  | 'last-90d'
  | 'next-7d'
  | 'next-30d'
  | 'custom';

export interface DateRange {
  preset: DateRangePreset;
  /** ISO timestamp, inclusive. */
  startIso: string | null;
  /** ISO timestamp, exclusive. */
  endIso: string | null;
}

export const DATE_RANGE_PRESET_LABELS: Record<DateRangePreset, string> = {
  none: 'No date range',
  today: 'Today',
  tomorrow: 'Tomorrow',
  'this-week': 'This week',
  'next-week': 'Next week',
  'this-month': 'This month',
  'last-7d': 'Last 7 days',
  'last-30d': 'Last 30 days',
  'last-90d': 'Last 90 days',
  'next-7d': 'Next 7 days',
  'next-30d': 'Next 30 days',
  custom: 'Custom range…',
};

export const EMPTY_DATE_RANGE: DateRange = {
  preset: 'none',
  startIso: null,
  endIso: null,
};

export function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Returns the start of the week (Monday) for `d`. */
export function startOfWeek(d: Date): Date {
  const copy = startOfDay(d);
  const day = copy.getDay(); // 0 = Sun, 1 = Mon
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfMonth(d: Date): Date {
  const copy = startOfDay(d);
  copy.setDate(1);
  return copy;
}

export function endOfMonth(d: Date): Date {
  const copy = startOfDay(d);
  copy.setMonth(copy.getMonth() + 1);
  copy.setDate(1);
  return copy;
}

/** Compute ISO start/end for a preset relative to "now". */
export function resolvePreset(preset: DateRangePreset): {
  startIso: string | null;
  endIso: string | null;
} {
  const now = new Date();
  switch (preset) {
    case 'today': {
      const s = startOfDay(now);
      return { startIso: s.toISOString(), endIso: addDays(s, 1).toISOString() };
    }
    case 'tomorrow': {
      const s = addDays(startOfDay(now), 1);
      return { startIso: s.toISOString(), endIso: addDays(s, 1).toISOString() };
    }
    case 'this-week': {
      const s = startOfWeek(now);
      return { startIso: s.toISOString(), endIso: addDays(s, 7).toISOString() };
    }
    case 'next-week': {
      const s = addDays(startOfWeek(now), 7);
      return { startIso: s.toISOString(), endIso: addDays(s, 7).toISOString() };
    }
    case 'this-month':
      return {
        startIso: startOfMonth(now).toISOString(),
        endIso: endOfMonth(now).toISOString(),
      };
    case 'last-7d':
      return {
        startIso: addDays(startOfDay(now), -7).toISOString(),
        endIso: now.toISOString(),
      };
    case 'last-30d':
      return {
        startIso: addDays(startOfDay(now), -30).toISOString(),
        endIso: now.toISOString(),
      };
    case 'last-90d':
      return {
        startIso: addDays(startOfDay(now), -90).toISOString(),
        endIso: now.toISOString(),
      };
    case 'next-7d':
      return {
        startIso: now.toISOString(),
        endIso: addDays(startOfDay(now), 8).toISOString(),
      };
    case 'next-30d':
      return {
        startIso: now.toISOString(),
        endIso: addDays(startOfDay(now), 31).toISOString(),
      };
    case 'none':
    case 'custom':
    default:
      return { startIso: null, endIso: null };
  }
}

/** True when the range is set to a concrete window (preset or custom). */
export function isRangeActive(range: DateRange): boolean {
  return range.preset !== 'none' && !!range.startIso && !!range.endIso;
}

export function isoToInputDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function inputDateToIso(value: string, endOfDay = false): string | null {
  if (!value) return null;
  const [yStr, mStr, dStr] = value.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
  if (endOfDay) {
    dt.setHours(23, 59, 59, 999);
  }
  return dt.toISOString();
}
