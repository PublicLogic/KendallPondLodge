import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const key = process.env.KPL_STORE_KEY?.trim() ?? '';
  if (!key) {
    return NextResponse.json({ ok: false, error: 'missing_kpl_key' }, { status: 503 });
  }

  try {
    const response = await fetch(
      'https://publiclogic-kpl-store.fly.dev/api/stayos/booking/booking-requests?limit=1',
      {
        headers: { Authorization: `Bearer ${key}` },
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(8000),
      },
    );

    let body: unknown = null;
    try { body = await response.json(); } catch {}

    return NextResponse.json(
      {
        ok: response.ok,
        status: response.status,
        booking_api: response.ok,
        body_shape:
          body && typeof body === 'object' && !Array.isArray(body)
            ? Object.keys(body as Record<string, unknown>).slice(0, 8)
            : [],
      },
      { status: response.ok ? 200 : 502, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ ok: false, error: 'dedicated_backend_unreachable' }, { status: 503 });
  }
}
