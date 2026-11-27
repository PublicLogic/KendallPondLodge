'use server';

import { redirect } from 'next/navigation';
import { after } from 'next/server';

import {
  bookingClient,
  directBookingEnabled,
  paymentConfigured,
  findQuote,
  BookingServiceError,
  type Booking,
} from '@/lib/booking-db';

import {
  airbnbStayStatus,
  fetchAirbnbIcs,
} from '@/lib/airbnb-ical.mjs';

import { nightsBetween, stayNights } from '@/lib/booking.mjs';
import { instantBookingAvailable } from '@/lib/direct-pricing.mjs';
import { guestPriceBreakdown } from '@/lib/guest-price-breakdown.mjs';
import { UUID } from '@/lib/pj-booking-client.mjs';

import { stripeRequest } from '@/lib/booking-stripe';

import {
  validateGuestRequest,
  beginGuestCheckout,
} from '@/lib/kpl-booking-core.mjs';

const BLOCKING_DIRECT_STATUSES = new Set([
  'checkout',
  'confirmed',
]);

const REQUEST_ERRORS_WITH_GUEST_GUIDANCE = new Set([
  'calendar_conflict',
  'overlaps_reservation',
  'overlapping_active_stay',
  'invalid_request',
  'idempotency_conflict',
  'rate_limited',
]);

function responseUuid(value: unknown): string {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new BookingServiceError(503, 'invalid_response');
  }
  return value;
}

function logQuoteEmailFailure(error: unknown) {
  const code = error instanceof BookingServiceError ? error.code : 'message_unavailable';
  console.error('Booking link email deferred:', code);
}

function directStayOverlap(
  wanted: string[],
  bookings: Booking[],
) {
  const wantedNights = new Set(wanted);

  for (const booking of bookings) {
    if (!BLOCKING_DIRECT_STATUSES.has(booking.status)) {
      continue;
    }

    let existing: string[];

    try {
      existing = nightsBetween(
        booking.check_in,
        booking.check_out,
      );
    } catch {
      throw new BookingServiceError(
        503,
        'service_unavailable',
      );
    }

    if (
      existing.some((night) =>
        wantedNights.has(night),
      )
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Guests submit directly to KPL.
 * No owner cookie, Google login or PJ session.
 *
 * The visible calendar is advisory UX only.
 * Submission always performs a fresh Airbnb read and PJ overlap check.
 */
export async function requestStay(form: FormData) {
  if (!directBookingEnabled()) {
    redirect('/book?status=unavailable');
  }

  try {
    const input = validateGuestRequest(
      Object.fromEntries(form.entries()),
    );

    const wantedNights = nightsBetween(
      input.check_in,
      input.check_out,
    );

    const ics = await fetchAirbnbIcs({
      fresh: true,
    });

    if (
      airbnbStayStatus(ics, wantedNights) !==
      'free'
    ) {
      throw new BookingServiceError(
        409,
        'calendar_conflict',
      );
    }

    const client = bookingClient();

    const existing =
      (await client.list(100)) as Booking[];

    if (
      directStayOverlap(
        wantedNights,
        existing,
      )
    ) {
      throw new BookingServiceError(
        409,
        'overlapping_active_stay',
      );
    }

    if (!instantBookingAvailable(await client.instantSettings())) {
      throw new BookingServiceError(503, 'unavailable');
    }

    const created = await client.createRequest(input);
    const id = responseUuid(created?.id);
    const priced = await client.autoPrice(id);
    const token = responseUuid(priced?.quote_token);

    // The email is a recovery copy of the private link returned to the guest.
    try {
      after(() => client.sendQuote(id).catch(logQuoteEmailFailure));
    } catch (error) {
      logQuoteEmailFailure(error);
    }
    return { received: true as const, instant_path: `/book/quote/${token}` };
  } catch (error) {
    const code =
      error instanceof BookingServiceError
        ? error.code
        : 'error';

    // Never guest fields, calendar URL, token, key or provider body.
    console.error('Booking request failed:', code);

    const status = REQUEST_ERRORS_WITH_GUEST_GUIDANCE.has(code) ? code : 'unavailable';
    redirect(`/book?status=${encodeURIComponent(status)}`);
  }
}

export async function payDeposit(form: FormData) {
  const token = String(form.get('token') ?? '');

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      token,
    )
  ) {
    redirect('/book');
  }

  if (
    !directBookingEnabled() ||
    !paymentConfigured()
  ) {
    redirect(
      `/book/quote/${token}?payment=unavailable`,
    );
  }

  let destination: string;

  try {
    const quote = await findQuote(token);
    if (!quote || !guestPriceBreakdown(quote, stayNights(quote.check_in, quote.check_out)).matches_total) {
      throw new BookingServiceError(503, 'invalid_response');
    }

    const result = await beginGuestCheckout({
      token,
      accepted:
        form.get('accepted') === 'yes',
      pj: bookingClient(),
      stripe: stripeRequest,
      origin:
        process.env.KPL_BOOKING_ORIGIN ?? '',
    });

    destination = result.url;
  } catch (error) {
    const code =
      error instanceof BookingServiceError
        ? error.code
        : 'error';

    console.error(
      'Booking checkout failed:',
      code,
    );

    redirect(
      `/book/quote/${token}?payment=${encodeURIComponent(code)}`,
    );
  }

  redirect(destination);
}
