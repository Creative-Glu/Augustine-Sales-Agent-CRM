import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/sync-retry
 * Body: { type: 'staff' | 'institution', id: number | string }
 * Triggers a sync retry for the given record. Optionally forwards to SYNC_RETRY_WEBHOOK_URL if set.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id } = body;

    if (!type || (type !== 'staff' && type !== 'institution')) {
      return NextResponse.json({ error: 'Invalid type: must be "staff" or "institution"' }, { status: 400 });
    }
    if (id === undefined || id === null) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const webhookUrl = process.env.SYNC_RETRY_WEBHOOK_URL;
    if (webhookUrl) {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });
      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json(
          { error: `Sync service returned ${res.status}: ${text}` },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ ok: true, type, id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Sync retry failed' },
      { status: 500 }
    );
  }
}
