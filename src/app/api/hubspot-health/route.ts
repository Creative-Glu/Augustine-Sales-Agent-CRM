import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter } from '@/lib/rate-limit';

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/**
 * GET /api/hubspot-health
 * Proxies to backend. HubSpot config and health are monitored on the backend; no token in frontend.
 * Backend should return: { enabled: boolean, worker_running: boolean }
 */
export async function GET(request: NextRequest) {
  const blocked = limiter(request);
  if (blocked) return blocked;
  try {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (!base) {
      return NextResponse.json({ enabled: false, worker_running: false });
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    let res: Response;
    try {
      res = await fetch(`${base}/api/hubspot-health`, { cache: 'no-store', signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
    if (!res.ok) {
      return NextResponse.json({ enabled: false, worker_running: false });
    }
    const data = await res.json();
    const enabled = data.enabled === true || data.enabled === 'true';
    const workerRunning = data.worker_running === true || data.worker_running === 'true' || data.workerRunning === true || data.workerRunning === 'true';
    return NextResponse.json({
      enabled: !!enabled,
      worker_running: !!workerRunning,
    });
  } catch {
    return NextResponse.json({ enabled: false, worker_running: false });
  }
}
