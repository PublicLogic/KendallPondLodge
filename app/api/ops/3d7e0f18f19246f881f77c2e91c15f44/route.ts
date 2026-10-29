import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

import {
  bookingClient,
  BookingServiceError,
} from '@/lib/booking-db';

export const dynamic = 'force-dynamic';

function authorized(request: Request): boolean {
  const expected = process.env.KPL_CUTOVER_TOKEN?.trim() ?? '';
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!expected || expected.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

function int(value: unknown, name: string, min: number, max: number): number {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw new Error(name);
  }
  return value as number;
}

function text(value: unknown, name: string): string {
  if (typeof value !== 'string') throw new Error(name);
  const out = value.trim();
  if (out.length < 20 || out.length > 4000) throw new Error(name);
  return out;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  if ((process.env.KPL_AIRBNB_IMPORT_TOKEN?.trim().length ?? 0) < 24) {
    return NextResponse.json({ ok: false, error: 'airbnb_import_calendar_not_ready' }, { status: 409 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  try {
    const client = bookingClient();

    // Email must be operational before instant booking can be switched on.
    const messages = await client.messageStatus();
    const readiness = messages?.readiness;
    if (
      readiness?.enabled !== true ||
      readiness?.sender_authorized !== true ||
      readiness?.provider_connected !== true ||
      readiness?.public_base_configured !== true ||
      !Number.isInteger(readiness?.owner_recipients) ||
      readiness.owner_recipients < 1
    ) {
      return NextResponse.json(
        { ok: false, error: 'booking_email_not_ready', readiness: readiness ?? null },
        { status: 409 },
      );
    }

    const saved = await client.updateInstantSettings({
      enabled: true,
      base_nightly_cents: int(body.base_nightly_cents, 'base_nightly_cents', 1, 1_000_000),
      weekend_nightly_cents: int(body.weekend_nightly_cents, 'weekend_nightly_cents', 1, 1_000_000),
      cleaning_cents: int(body.cleaning_cents, 'cleaning_cents', 0, 1_000_000),
      pet_fee_cents: int(body.pet_fee_cents, 'pet_fee_cents', 0, 1_000_000),
      pet_fee_mode: body.pet_fee_mode === 'per_pet' ? 'per_pet' : 'per_stay',
      tax_basis_points: int(body.tax_basis_points, 'tax_basis_points', 0, 3000),
      taxable_fees: body.taxable_fees === true,
      airbnb_channel_guarded: true,
      deposit_percent: int(body.deposit_percent, 'deposit_percent', 1, 100),
      min_nights: int(body.min_nights, 'min_nights', 1, 30),
      booking_window_days: int(body.booking_window_days, 'booking_window_days', 1, 730),
      hold_minutes: int(body.hold_minutes, 'hold_minutes', 90, 360),
      cancellation_terms: text(body.cancellation_terms, 'cancellation_terms'),
      balance_terms: text(body.balance_terms, 'balance_terms'),
    });

    return NextResponse.json({
      ok: true,
      instant: {
        configured: saved?.configured === true,
        enabled: saved?.enabled === true,
        airbnb_channel_guarded: saved?.airbnb_channel_guarded === true,
        base_nightly_cents: saved?.base_nightly_cents ?? null,
        weekend_nightly_cents: saved?.weekend_nightly_cents ?? null,
        cleaning_cents: saved?.cleaning_cents ?? null,
        pet_fee_cents: saved?.pet_fee_cents ?? null,
        tax_basis_points: saved?.tax_basis_points ?? null,
        deposit_percent: saved?.deposit_percent ?? null,
        min_nights: saved?.min_nights ?? null,
        booking_window_days: saved?.booking_window_days ?? null,
        hold_minutes: saved?.hold_minutes ?? null,
      },
      messaging: readiness,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const safe = error instanceof BookingServiceError
      ? error.code
      : 'invalid_policy';
    return NextResponse.json({ ok: false, error: safe }, { status: 503 });
  }
}
