import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/sync-queue?status=&entity_type=&limit=
 * Returns sync queue jobs and optional metrics.
 * Backend may be implemented elsewhere; this stub returns empty data so the UI works.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? '';
    const entity_type = searchParams.get('entity_type') ?? '';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10) || 50));

    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    const url = base ? `${base}/api/sync-queue?${new URLSearchParams({
      ...(status && { status }),
      ...(entity_type && { entity_type }),
      limit: String(limit),
    }).toString()}` : null;
    const res = url ? await fetch(url, { cache: 'no-store' }).catch(() => null) : null;

    if (res?.ok) {
      const raw = await res.json();

      // Normalise a single job so frontend gets queue_id, entity_name (with institution/staff ref), attempts.
      const normalizeJob = (job: any) => {
        const type = String(job.entity_type ?? 'entity').toLowerCase();
        const ref = job.entity_id ?? job.id ?? '';
        const refLabel = type === 'institution' ? 'Institution' : type === 'staff' ? 'Staff' : type;
        const entityName =
          job.entity_name ?? job.name ?? job.institution_name ?? job.staff_name
          ?? `${refLabel} #${ref}`;
        return {
          ...job,
          queue_id: String(job.queue_id ?? job.id ?? ''),
          entity_name: entityName,
          attempts:
          typeof job.attempts === 'number'
            ? job.attempts
            : typeof job.attempt_count === 'number'
              ? job.attempt_count
              : 0,
        };
      };

      const buildMetrics = (jobs: any[]) => {
        let pending = 0, processing = 0, failed = 0, success = 0;
        let attemptsSum = 0, attemptsCount = 0;
        let oldestPendingAt: string | null = null;
        for (const job of jobs) {
          const s = String(job.status ?? '').toLowerCase();
          if (s === 'pending') pending += 1;
          else if (s === 'processing') processing += 1;
          else if (s === 'failed') failed += 1;
          else if (s === 'success') success += 1;
          if (typeof job.attempts === 'number') {
            attemptsSum += job.attempts;
            attemptsCount += 1;
          }
          if (s === 'pending' && job.created_at) {
            const ts = new Date(job.created_at).toISOString();
            if (!oldestPendingAt || ts < oldestPendingAt) oldestPendingAt = ts;
          }
        }
        return {
          total: jobs.length,
          pending,
          processing,
          failed,
          success,
          avg_attempts: attemptsCount > 0 ? attemptsSum / attemptsCount : 0,
          oldest_pending_at: oldestPendingAt,
        };
      };

      // If backend already returns { data: [...] }, normalize each item then return.
      if (raw && Array.isArray(raw.data)) {
        const normalized = (raw.data as any[]).map(normalizeJob);
        return NextResponse.json({
          ...raw,
          data: normalized,
          metrics: raw.metrics ?? buildMetrics(normalized),
        });
      }

      // Helper to compute metrics and build full response from a list of jobs.
      const buildResponse = (jobsInput: any[], totalOverride?: number) => {
        const jobs = jobsInput.map(normalizeJob);
        const total = totalOverride ?? jobs.length;
        const metrics = buildMetrics(jobs);
        return NextResponse.json({ data: jobs, total, metrics });
      };

      // If backend returns a bare array of jobs, wrap it so the frontend can consume it.
      if (Array.isArray(raw)) {
        return buildResponse(raw as any[]);
      }

      // If backend returns { items: [...], count }, adapt it.
      if (raw && Array.isArray(raw.items)) {
        const items = raw.items as any[];
        const count = typeof raw.count === 'number' ? raw.count : items.length;
        return buildResponse(items, count);
      }

      // Fallback: forward whatever backend returned.
      return NextResponse.json(raw);
    }

    return NextResponse.json({
      data: [],
      total: 0,
      metrics: {
        total: 0,
        pending: 0,
        processing: 0,
        failed: 0,
        success: 0,
        avg_attempts: 0,
        oldest_pending_at: null,
      },
    });
  } catch {
    return NextResponse.json(
      {
        data: [],
        total: 0,
        metrics: {
          total: 0,
          pending: 0,
          processing: 0,
          failed: 0,
          success: 0,
          avg_attempts: 0,
          oldest_pending_at: null,
        },
      },
      { status: 200 }
    );
  }
}
