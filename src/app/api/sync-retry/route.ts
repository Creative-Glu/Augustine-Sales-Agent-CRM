import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter } from '@/lib/rate-limit';

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

/**
 * POST /api/sync-retry
 * Body (queue retry): { type: 'queue', queue_id: string }
 * Body (legacy):      { type: 'staff' | 'institution', id: number | string }
 * Forwards to SYNC_RETRY_WEBHOOK_URL. Backend expects type='queue' and queue_id.
 */
export async function POST(request: NextRequest) {
  const blocked = limiter(request);
  if (blocked) return blocked;
  try {
    const body = await request.json();
    const { type, queue_id, id } = body;

    const isQueueRetry = type === 'queue' && queue_id != null && String(queue_id).trim() !== '';
    const isEntityRetry = (type === 'staff' || type === 'institution') && (id !== undefined && id !== null);

    if (!isQueueRetry && !isEntityRetry) {
      return NextResponse.json(
        { error: "Invalid body: use { type: 'queue', queue_id } or { type: 'staff'|'institution', id }" },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.SYNC_RETRY_WEBHOOK_URL;
    if (webhookUrl) {
      const payload = isQueueRetry
        ? { type: 'queue' as const, queue_id: String(queue_id).trim(), id: String(queue_id).trim() }
        : { type, id };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);
      let res: Response;
      try {
        res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!res.ok) {
        // Don't leak internal webhook error details to client
        return NextResponse.json(
          { error: `Sync service returned an error (${res.status}). Please try again.` },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      isQueueRetry ? { ok: true, type: 'queue', queue_id } : { ok: true, type, id }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Sync retry failed' },
      { status: 500 }
    );
  }
}
