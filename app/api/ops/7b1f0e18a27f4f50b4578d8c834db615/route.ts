import { NextResponse } from 'next/server';
import { bookingClient, BookingServiceError } from '@/lib/booking-db';

export const dynamic = 'force-dynamic';

function safeError(error: unknown) {
  return error instanceof BookingServiceError
    ? { status: error.status, code: error.code }
    : { status: 503, code: 'unknown' };
}

export async function GET() {
  let client;
  try {
    client = bookingClient();
  } catch (error) {
    return NextResponse.json({ client: safeError(error) }, { status: 503 });
  }

  let instant: unknown = null;
  let instantError: unknown = null;
  let messaging: unknown = null;
  let messagingError: unknown = null;

  try {
    const value = await client.instantSettings();
    instant = {
      configured: value?.configured === true,
      enabled: value?.enabled === true,
      base_nightly_cents: value?.base_nightly_cents ?? null,
      weekend_nightly_cents: value?.weekend_nightly_cents ?? null,
      cleaning_cents: value?.cleaning_cents ?? null,
      pet_fee_cents: value?.pet_fee_cents ?? null,
      pet_fee_mode: value?.pet_fee_mode ?? null,
      tax_basis_points: value?.tax_basis_points ?? null,
      taxable_fees: value?.taxable_fees ?? null,
      airbnb_channel_guarded: value?.airbnb_channel_guarded ?? null,
      deposit_percent: value?.deposit_percent ?? null,
      min_nights: value?.min_nights ?? null,
      booking_window_days: value?.booking_window_days ?? null,
      hold_minutes: value?.hold_minutes ?? null,
      cancellation_terms: value?.cancellation_terms ?? null,
      balance_terms: value?.balance_terms ?? null,
    };
  } catch (error) {
    instantError = safeError(error);
  }

  try {
    const value = await client.messageStatus();
    messaging = value?.readiness ?? null;
  } catch (error) {
    messagingError = safeError(error);
  }

  let list: unknown = null;
  let listError: unknown = null;
  try {
    const value = await client.list(1);
    list = { ok: Array.isArray(value) };
  } catch (error) {
    listError = safeError(error);
  }

  return NextResponse.json(
    {
      backend: client.base,
      instant,
      instantError,
      messaging,
      messagingError,
      list,
      listError,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
