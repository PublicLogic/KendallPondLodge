import { NextResponse } from 'next/server';
import { bookingClient } from '@/lib/booking-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await bookingClient().instantSettings();
    return NextResponse.json({
      configured: settings?.configured === true,
      enabled: settings?.enabled === true,
      base_nightly_cents: settings?.base_nightly_cents ?? null,
      weekend_nightly_cents: settings?.weekend_nightly_cents ?? null,
      cleaning_cents: settings?.cleaning_cents ?? null,
      pet_fee_cents: settings?.pet_fee_cents ?? null,
      pet_fee_mode: settings?.pet_fee_mode ?? null,
      tax_basis_points: settings?.tax_basis_points ?? null,
      taxable_fees: settings?.taxable_fees ?? null,
      airbnb_channel_guarded: settings?.airbnb_channel_guarded ?? null,
      deposit_percent: settings?.deposit_percent ?? null,
      min_nights: settings?.min_nights ?? null,
      booking_window_days: settings?.booking_window_days ?? null,
      hold_minutes: settings?.hold_minutes ?? null,
      cancellation_terms: settings?.cancellation_terms ?? null,
      balance_terms: settings?.balance_terms ?? null,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
