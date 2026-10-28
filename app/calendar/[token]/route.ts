import { bookingClient } from '@/lib/booking-db';
import { buildDirectBookingCalendar } from '@/lib/direct-calendar.mjs';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const configured = process.env.KPL_AIRBNB_IMPORT_TOKEN?.trim() ?? '';
  const { token } = await params;
  if (!configured || token !== configured + '.ics') return new Response('Not found', { status: 404 });
  try {
    const bookings = await bookingClient().list(100);
    return new Response(buildDirectBookingCalendar(bookings), {
      status: 200,
      headers: {
        'content-type': 'text/calendar; charset=utf-8',
        'cache-control': 'private, no-store, max-age=0',
        'content-disposition': 'inline; filename="kendall-pond-direct.ics"',
        'x-robots-tag': 'noindex, nofollow, noarchive',
      },
    });
  } catch {
    return new Response('Calendar temporarily unavailable', { status: 503, headers: { 'cache-control': 'no-store' } });
  }
}
