import { NextResponse } from 'next/server';
import { bookingClient } from '@/lib/booking-db';

export const dynamic = 'force-dynamic';

function rehearsalOnly() {
  return process.env.VERCEL_ENV === 'preview' &&
    process.env.VERCEL_GIT_COMMIT_REF === 'test/pj-staging-e2e-20261027';
}

export async function POST() {
  if (!rehearsalOnly()) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const url = process.env.KPL_AIRBNB_ICAL_URL ?? '';
  if (!/^https:\/\/(?:www\.)?airbnb\.com\/calendar\/ical\//i.test(url)) {
    return NextResponse.json({ error: 'calendar_not_configured' }, { status: 503 });
  }
  try {
    const client = bookingClient();
    const before = await client.contentStatus();
    if (!before?.calendarConfigured) await client.registerCalendar(url);
    const after = await client.contentStatus();
    return NextResponse.json({
      ok: after?.calendarConfigured === true,
      calendarConfigured: after?.calendarConfigured === true,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'booking_service_unavailable' }, { status: 503 });
  }
}
