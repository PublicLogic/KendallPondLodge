import { NextResponse } from 'next/server';
import { bookingClient } from '@/lib/booking-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = bookingClient();
    const [instant, messages] = await Promise.all([
      client.instantSettings(),
      client.messageStatus(),
    ]);
    return NextResponse.json({
      instant: {
        configured: instant?.configured === true,
        enabled: instant?.enabled === true,
        base_nightly_cents: instant?.base_nightly_cents ?? null,
        weekend_nightly_cents: instant?.weekend_nightly_cents ?? null,
        cleaning_cents: instant?.cleaning_cents ?? null,
        pet_fee_cents: instant?.pet_fee_cents ?? null,
        pet_fee_mode: instant?.pet_fee_mode ?? null,
        tax_basis_points: instant?.tax_basis_points ?? null,
        taxable_fees: instant?.taxable_fees ?? null,
        airbnb_channel_guarded: instant?.airbnb_channel_guarded ?? null,
        deposit_percent: instant?.deposit_percent ?? null,
        min_nights: instant?.min_nights ?? null,
        booking_window_days: instant?.booking_window_days ?? null,
        hold_minutes: instant?.hold_minutes ?? null,
        cancellation_terms: instant?.cancellation_terms ?? null,
        balance_terms: instant?.balance_terms ?? null,
      },
      messaging: messages?.readiness ?? null,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
