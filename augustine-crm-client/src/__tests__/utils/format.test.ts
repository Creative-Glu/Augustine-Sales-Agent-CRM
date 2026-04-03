import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatDateTimeShort,
  formatRelativeTime,
  truncate,
  cellValue,
  formatPrice,
} from '@/utils/format';

describe('formatDate', () => {
  it('formats a valid ISO date', () => {
    const result = formatDate('2024-03-15T10:30:00Z');
    expect(result).toContain('2024');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
  });

  it('returns N/A for null', () => {
    expect(formatDate(null)).toBe('N/A');
  });

  it('returns N/A for undefined', () => {
    expect(formatDate(undefined)).toBe('N/A');
  });

  it('returns N/A for empty string', () => {
    expect(formatDate('')).toBe('N/A');
  });
});

describe('formatDateTime', () => {
  it('formats a valid ISO date with time', () => {
    const result = formatDateTime('2024-03-15T10:30:00Z');
    expect(result).toContain('2024');
    expect(result).not.toBe('—');
  });

  it('returns — for null', () => {
    expect(formatDateTime(null)).toBe('—');
  });

  it('returns — for undefined', () => {
    expect(formatDateTime(undefined)).toBe('—');
  });
});

describe('formatRelativeTime', () => {
  it('returns — for null', () => {
    expect(formatRelativeTime(null)).toBe('—');
  });

  it('returns overdue for past dates', () => {
    const past = new Date(Date.now() - 60000).toISOString();
    expect(formatRelativeTime(past)).toBe('overdue');
  });

  it('returns relative time for future dates', () => {
    const future = new Date(Date.now() + 5 * 60000).toISOString();
    const result = formatRelativeTime(future);
    expect(result).toMatch(/^in \d+m$/);
  });
});

describe('truncate', () => {
  it('returns — for null', () => {
    expect(truncate(null)).toBe('—');
  });

  it('returns string unchanged if shorter than max', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates with ellipsis if longer than max', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcde…');
  });
});

describe('cellValue', () => {
  it('returns value for non-empty string', () => {
    expect(cellValue('hello')).toBe('hello');
  });

  it('returns — for null', () => {
    expect(cellValue(null)).toBe('—');
  });

  it('returns — for empty string', () => {
    expect(cellValue('')).toBe('—');
  });

  it('returns — for whitespace-only string', () => {
    expect(cellValue('   ')).toBe('—');
  });
});

describe('formatPrice', () => {
  it('formats a number as USD', () => {
    expect(formatPrice(99.99)).toBe('$99.99');
  });

  it('returns N/A for null', () => {
    expect(formatPrice(null)).toBe('N/A');
  });
});
