import { describe, it, expect } from 'vitest';
import { sanitizeUrl, looksLikeUrl } from '@/utils/url';

describe('sanitizeUrl', () => {
  it('returns # for null', () => {
    expect(sanitizeUrl(null)).toBe('#');
  });

  it('returns # for empty string', () => {
    expect(sanitizeUrl('')).toBe('#');
  });

  it('blocks javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
  });

  it('blocks data: protocol', () => {
    expect(sanitizeUrl('data:text/html,<h1>XSS</h1>')).toBe('#');
  });

  it('blocks vbscript: protocol', () => {
    expect(sanitizeUrl('vbscript:msgbox')).toBe('#');
  });

  it('blocks protocol-relative URLs', () => {
    expect(sanitizeUrl('//evil.com')).toBe('#');
  });

  it('prepends https:// for bare domains', () => {
    expect(sanitizeUrl('example.com')).toBe('https://example.com');
  });

  it('preserves valid https URLs', () => {
    expect(sanitizeUrl('https://example.com/path')).toBe('https://example.com/path');
  });

  it('preserves valid http URLs', () => {
    expect(sanitizeUrl('http://localhost:3000')).toBe('http://localhost:3000');
  });

  it('preserves mailto: URLs', () => {
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
  });

  it('trims whitespace', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
  });
});

describe('looksLikeUrl', () => {
  it('returns true for https URL', () => {
    expect(looksLikeUrl('https://example.com')).toBe(true);
  });

  it('returns true for domain-like string', () => {
    expect(looksLikeUrl('example.com')).toBe(true);
  });

  it('returns false for plain text', () => {
    expect(looksLikeUrl('just some text')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(looksLikeUrl('')).toBe(false);
  });
});
