import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple in-memory sliding-window rate limiter for Next.js API routes.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
 *
 *   export async function POST(request: NextRequest) {
 *     const blocked = limiter(request);
 *     if (blocked) return blocked;
 *     // ... handle request
 *   }
 *
 * NOTE: In-memory state resets on cold start / redeploy.
 * For distributed rate limiting, use a Redis-backed solution.
 */

interface RateLimitConfig {
  /** Time window in milliseconds (default: 60 seconds). */
  windowMs?: number;
  /** Maximum requests per window per IP (default: 30). */
  max?: number;
  /** Response message when rate limited (default: 'Too many requests'). */
  message?: string;
}

interface WindowEntry {
  timestamps: number[];
}

export function createRateLimiter(config: RateLimitConfig = {}) {
  const { windowMs = 60_000, max = 30, message = 'Too many requests. Please try again later.' } = config;
  const store = new Map<string, WindowEntry>();

  // Cleanup stale entries every 5 minutes to prevent memory leaks
  const CLEANUP_INTERVAL = 5 * 60_000;
  let lastCleanup = Date.now();

  function cleanup(now: number) {
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    const cutoff = now - windowMs;
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }

  /**
   * Check rate limit for a request.
   * Returns a 429 NextResponse if rate limited, or null if allowed.
   */
  return function rateLimit(request: NextRequest): NextResponse | null {
    const now = Date.now();
    cleanup(now);

    // Use X-Forwarded-For (Netlify/Vercel set this), fallback to a generic key
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const entry = store.get(ip) ?? { timestamps: [] };

    // Remove timestamps outside the window
    const cutoff = now - windowMs;
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

    if (entry.timestamps.length >= max) {
      const retryAfterSec = Math.ceil((entry.timestamps[0] + windowMs - now) / 1000);
      return NextResponse.json(
        { error: message },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    entry.timestamps.push(now);
    store.set(ip, entry);

    return null; // Allowed
  };
}
