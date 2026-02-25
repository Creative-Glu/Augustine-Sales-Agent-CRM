import { NextResponse } from 'next/server';

/**
 * GET /api/hubspot-health
 * Proxies to backend. HubSpot config and health are monitored on the backend; no token in frontend.
 * Backend should return: { enabled: boolean, worker_running: boolean }
 */
export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (!base) {
      return NextResponse.json({ enabled: false, worker_running: false });
    }
    const res = await fetch(`${base}/api/hubspot-health`, { cache: 'no-store' });
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
