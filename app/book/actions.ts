'use server';

import { redirect } from 'next/navigation';
import { bookingClient, directBookingEnabled, paymentConfigured, BookingServiceError } from '@/lib/booking-db';
import { stripeRequest } from '@/lib/booking-stripe';
import { validateGuestRequest, beginGuestCheckout } from '@/lib/kpl-booking-core.mjs';

/** Guests submit directly to KPL. No owner cookie, Google login or PJ session. */
export async function requestStay(form: FormData) {
  if (!directBookingEnabled()) redirect('/book?status=unavailable');
  try {
    const input = validateGuestRequest(Object.fromEntries(form.entries()));
    await bookingClient().createRequest(input);
  } catch (error) {
    const code = error instanceof BookingServiceError ? error.code : 'error';
    console.error('Booking request failed:', code); // Never guest fields, token, key or provider body.
    redirect(`/book?status=${encodeURIComponent(code)}`);
  }
  redirect('/book?status=received');
}

export async function payDeposit(form: FormData) {
  const token = String(form.get('token') ?? '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) redirect('/book');
  if (!directBookingEnabled() || !paymentConfigured()) redirect(`/book/quote/${token}?payment=unavailable`);
  let destination: string;
  try {
    const result = await beginGuestCheckout({
      token, accepted: form.get('accepted') === 'yes', pj: bookingClient(), stripe: stripeRequest,
      origin: process.env.KPL_BOOKING_ORIGIN ?? '',
    });
    destination = result.url;
  } catch (error) {
    const code = error instanceof BookingServiceError ? error.code : 'error';
    console.error('Booking checkout failed:', code);
    redirect(`/book/quote/${token}?payment=${encodeURIComponent(code)}`);
  }
  redirect(destination);
}
