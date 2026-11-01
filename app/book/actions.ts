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
import { guestPriceBreakdown } from '@/lib/guest-price-breakdown.mjs';

import { stripeRequest } from '@/lib/booking-stripe';
import { submitGuestQuestion } from '@/app/ask/actions';

import {
  validateGuestRequest,
  beginGuestCheckout,
} from '@/lib/kpl-booking-core.mjs';

const BLOCKING_DIRECT_STATUSES = new Set([
  'checkout',
  'confirmed',
]);

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

    if (form.get('intent') === 'inquiry') {
      // A date question is an inquiry Case, NOT a booking request. It never
      // triggers instant-booking price/payment messaging or holds inventory.
      const question = new FormData();
      question.set('guest_name', input.guest_name);
      question.set('guest_email', input.guest_email);
      question.set('check_in', input.check_in);
      question.set('check_out', input.check_out);
      question.set('client_request_id', input.request_key ?? crypto.randomUUID());
      question.set('message', [
        'I have a question about these dates: ' + input.check_in + ' to ' + input.check_out + '.',
        'Guests: ' + input.guests + '. Pets: ' + input.pets + '.',
        input.note ? 'Message: ' + input.note : 'Please contact me about this stay.',
      ].join(' '));
      const result = await submitGuestQuestion(question);
      if (!result.received) throw new BookingServiceError(503, 'message_unavailable');
      return { received: true as const, inquiry: true as const };
    }

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

    const created = await client.createRequest(input);

    try {
      const instant = await client.instantSettings();
      if (instant?.enabled === true) {
        const priced = await client.autoPrice(created.id);
        if (priced?.quote_token) {
          // The browser moves to the price/payment page immediately. Email is
          // a recovery copy of the same private payment link, never a gate.
          after(async () => {
            try {
              await client.sendQuote(created.id);
            } catch (emailError) {
              const emailCode =
                emailError instanceof BookingServiceError
                  ? emailError.code
                  : 'message_unavailable';
              console.error('Booking link email deferred:', emailCode);
            }
          });

          return {
            received: true as const,
            instant_path: `/book/quote/${priced.quote_token}`,
          };
        }
      }
    } catch (error) {
      if (!(error instanceof BookingServiceError && error.status === 404)) {
        throw error;
      }
    }
  } catch (error) {
    const code =
      error instanceof BookingServiceError
        ? error.code
        : 'error';

    // Never guest fields, calendar URL, token, key or provider body.
    console.error('Booking request failed:', code);

    redirect(
      `/book?status=${encodeURIComponent(code)}`,
    );
  }

  // This acknowledgement is tied to the awaited submission. A stale receipt
  // URL must never clear a newer, ambiguous request's browser retry identity.
  return { received: true as const };
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
    // Price presentation must reconcile with PJ's authoritative total before
    // any new Stripe session is opened, even on a directly submitted action.
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
