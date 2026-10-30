import { randomUUID, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

import {
  bookingClient,
  BookingServiceError,
  type Booking,
} from '@/lib/booking-db';

import {
  blockedNightsFromIcs,
  fetchAirbnbIcs,
} from '@/lib/airbnb-ical.mjs';

import {
  nightsBetween,
  propertyToday,
} from '@/lib/booking.mjs';

import { beginGuestCheckout } from '@/lib/kpl-booking-core.mjs';
import { stripeRequest } from '@/lib/booking-stripe';
import { buildDirectBookingCalendar } from '@/lib/direct-calendar.mjs';

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

function addDays(value: string, days: number): string {
  const date = new Date(value + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function findTestStay(client: ReturnType<typeof bookingClient>, minNights: number, bookingWindowDays: number) {
  const blocked = new Set<string>();
  const ics = await fetchAirbnbIcs({ fresh: true });
  for (const night of blockedNightsFromIcs(ics)) blocked.add(night);

  const existing = (await client.list(100)) as Booking[];
  for (const booking of existing) {
    if (!['checkout', 'confirmed'].includes(booking.status)) continue;
    for (const night of nightsBetween(booking.check_in, booking.check_out)) {
      blocked.add(night);
    }
  }

  const today = propertyToday();
  const maxOffset = Math.max(2, Math.min(45, bookingWindowDays - minNights));
  for (let offset = 2; offset <= maxOffset; offset += 1) {
    const checkIn = addDays(today, offset);
    const checkOut = addDays(checkIn, minNights);
    const nights = nightsBetween(checkIn, checkOut);
    if (nights.every((night) => !blocked.has(night))) {
      return { checkIn, checkOut };
    }
  }
  return null;
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

    const airbnbSource = process.env.KPL_AIRBNB_ICAL_URL?.trim() ?? '';
    if (!/^https:\/\/[^\s]+$/i.test(airbnbSource)) {
      return NextResponse.json({ ok: false, error: 'airbnb_source_not_ready' }, { status: 409 });
    }

    await client.registerCalendar(airbnbSource);
    const contentStatus = await client.contentStatus();
    if (contentStatus?.calendarConfigured !== true) {
      return NextResponse.json({ ok: false, error: 'airbnb_source_not_registered' }, { status: 409 });
    }

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

    const policy = {
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
      hold_minutes: int(body.hold_minutes, 'hold_minutes', 60, 10_080),
      cancellation_terms: text(body.cancellation_terms, 'cancellation_terms'),
      balance_terms: text(body.balance_terms, 'balance_terms'),
    };

    const saved = await client.updateInstantSettings(policy);

    let testBooking: Booking | null = null;
    try {
      const dates = await findTestStay(client, policy.min_nights, policy.booking_window_days);
      if (!dates) throw new Error('no_test_dates');

      testBooking = await client.createRequest({
        check_in: dates.checkIn,
        check_out: dates.checkOut,
        guest_name: 'KPL Launch Test',
        guest_email: 'info@publiclogic.org',
        guests: 1,
        pets: 0,
        note: 'Automated launch verification; released immediately.',
        request_key: randomUUID(),
      }) as Booking;

      const priced = await client.autoPrice(testBooking.id);
      if (!priced?.quote_token) throw new Error('test_not_priced');

      const pricedBookings = await client.list(100) as Booking[];
      const quotedIcs = buildDirectBookingCalendar(pricedBookings);
      if (quotedIcs.includes(`UID:${testBooking.id}@kendallpondlodge.com`)) {
        throw new Error('quote_unexpectedly_holds_inventory');
      }

      const sent = await client.sendQuote(testBooking.id);
      if (sent?.provider_accepted !== true || sent?.status !== 'sent') {
        throw new Error('email_not_accepted');
      }

      await beginGuestCheckout({
        token: priced.quote_token,
        accepted: true,
        pj: client,
        stripe: stripeRequest,
        origin: process.env.KPL_BOOKING_ORIGIN ?? '',
      });

      const checkoutBooking = await client.get(testBooking.id) as Booking | null;
      const sessionId = checkoutBooking?.stripe_session_id ?? '';
      if (!/^cs_(?:test|live)_[A-Za-z0-9]{8,200}$/.test(sessionId)) {
        throw new Error('stripe_session_not_attached');
      }

      const checkoutBookings = await client.list(100) as Booking[];
      const checkoutIcs = buildDirectBookingCalendar(checkoutBookings);
      const expectedStart = dates.checkIn.replaceAll('-', '');
      const expectedEnd = dates.checkOut.replaceAll('-', '');
      if (
        !checkoutIcs.includes(`UID:${testBooking.id}@kendallpondlodge.com`) ||
        !checkoutIcs.includes(`DTSTART;VALUE=DATE:${expectedStart}`) ||
        !checkoutIcs.includes(`DTEND;VALUE=DATE:${expectedEnd}`)
      ) {
        throw new Error('checkout_hold_missing_from_airbnb_feed');
      }

      const expired = await stripeRequest<Record<string, unknown>>(
        `checkout/sessions/${encodeURIComponent(sessionId)}/expire`,
        new URLSearchParams(),
      );
      if (expired?.status !== 'expired') {
        throw new Error('stripe_session_not_expired');
      }

      await client.release(testBooking.id);

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
        calendar_test: {
          quote_does_not_hold_inventory: true,
          checkout_hold_in_outbound_feed: true,
          check_in: dates.checkIn,
          check_out: dates.checkOut,
        },
        email_test: {
          provider_accepted: true,
          released: true,
          check_in: dates.checkIn,
          check_out: dates.checkOut,
        },
        checkout_test: {
          created: true,
          attached: true,
          expired: true,
          charged: false,
        },
      }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (testError) {
      if (testBooking) {
        try { await client.release(testBooking.id); } catch {}
      }
      try {
        await client.updateInstantSettings({ ...policy, enabled: false });
      } catch {}
      return NextResponse.json({
        ok: false,
        error: testError instanceof Error ? testError.message : 'email_test_failed',
        instant_disabled: true,
      }, { status: 502 });
    }
  } catch (error) {
    const safe = error instanceof BookingServiceError
      ? error.code
      : 'invalid_policy';
    return NextResponse.json({ ok: false, error: safe }, { status: 503 });
  }
}
