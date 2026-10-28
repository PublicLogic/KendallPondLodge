'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { OWNER_COOKIE_NAME, verifyOwnerSessionToken } from '@/lib/owner-auth.mjs';
import { bookingDb, bookingClient, directBookingEnabled, type Booking, BookingServiceError } from '@/lib/booking-db';
import { propertyToday, quoteAmounts, stayNights, nightsBetween } from '@/lib/booking.mjs';
import { airbnbStayStatus, fetchAirbnbIcs } from '@/lib/airbnb-ical.mjs';
import { stripeRequest } from '@/lib/booking-stripe';

export async function issueQuote(form: FormData) {
  const session = (await cookies()).get(OWNER_COOKIE_NAME)?.value;
  if (!verifyOwnerSessionToken(session)) redirect('/owner/access?next=/owner/bookings');
  if (!directBookingEnabled()) redirect('/owner/bookings?status=unavailable');
  const id = String(form.get('id') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect('/owner/bookings?status=invalid');
  try {
    const rows = await bookingDb<{ check_in: string; check_out: string; status: string }[]>(
      `kpl_booking_requests?id=eq.${encodeURIComponent(id)}&select=check_in,check_out,status`,
    );
    const request = rows[0];
    if (!request || request.status !== 'requested') throw new Error('Request is no longer open.');
    if (request.check_in <= propertyToday()) throw new Error('Stay dates are no longer in the future.');
    if (form.get('availability_checked') !== 'yes') throw new Error('Confirm the Airbnb block step before quoting.');
    const requestedNights = nightsBetween(request.check_in, request.check_out);
    let ics;
    try { ics = await fetchAirbnbIcs({ fresh: true }); }
    catch { throw new Error("Couldn't check Airbnb — try again."); }
    if (airbnbStayStatus(ics, requestedNights) !== 'free') throw new Error('These dates already show blocked on Airbnb.');
    const nights = stayNights(request.check_in, request.check_out);
    const cents = (key: string) => {
      const value = String(form.get(key) ?? '');
      if (!/^\d{1,6}(?:\.\d{1,2})?$/.test(value)) throw new Error(`Invalid ${key}.`);
      const [dollars, fractional = ''] = value.split('.');
      return Number(dollars) * 100 + Number(fractional.padEnd(2, '0'));
    };
    const nightly = cents('nightly');
    const cleaning = cents('cleaning');
    const pet = cents('pet');
    const tax = cents('tax');
    const other = cents('other');
    const deposit = cents('deposit');
    const { total } = quoteAmounts({ nights, nightly, cleaning, pet, tax, other, deposit });
    const otherLabel = String(form.get('other_label') ?? '').trim();
    const cancellation = String(form.get('cancellation_terms') ?? '').trim();
    const balance = String(form.get('balance_terms') ?? '').trim();
    if (other > 0 && (otherLabel.length < 3 || otherLabel.length > 80)) throw new Error('Name the other fee.');
    if (cancellation.length < 20 || cancellation.length > 2000 || balance.length < 20 || balance.length > 1000) throw new Error('Write complete cancellation and balance terms.');
    const expires = new Date(Math.min(Date.now() + 48 * 3600000, Date.parse(`${request.check_in}T00:00:00Z`))).toISOString();
    if (Date.parse(expires) <= Date.now() + 65 * 60000) throw new Error('Not enough time remains to pay this quote.');
    await bookingDb<string>('rpc/kpl_issue_quote', { method: 'POST', body: {
      p_id: id, p_nightly: nightly, p_cleaning: cleaning, p_pet: pet,
      p_tax: tax, p_other: other, p_other_label: other ? otherLabel : '',
      p_deposit: deposit, p_total: total, p_cancellation: cancellation,
      p_balance: balance, p_expires: expires,
    }, returnRows: true });
  } catch (error) {
    const code = error instanceof BookingServiceError ? error.code : 'quote-error';
    console.error('Could not issue quote:', code);
    redirect(`/owner/bookings?status=${encodeURIComponent(code)}`);
  }
  redirect('/owner/bookings?status=quoted');
}

export async function autoPriceRequest(form: FormData) {
  const cookie = (await cookies()).get(OWNER_COOKIE_NAME)?.value;
  if (!verifyOwnerSessionToken(cookie)) redirect('/owner/access?next=/owner/bookings');
  const id = String(form.get('id') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect('/owner/bookings?status=invalid');
  try {
    await bookingClient().autoPrice(id);
  } catch (error) {
    const code = error instanceof BookingServiceError ? error.code : 'auto-price-error';
    console.error('Could not apply booking policy:', code);
    redirect(`/owner/bookings?status=${encodeURIComponent(code)}`);
  }
  redirect('/owner/bookings?status=auto-priced');
}

export async function releaseQuote(form: FormData) {
  const cookie = (await cookies()).get(OWNER_COOKIE_NAME)?.value;
  if (!verifyOwnerSessionToken(cookie)) redirect('/owner/access?next=/owner/bookings');
  const id = String(form.get('id') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect('/owner/bookings?status=invalid');
  try {
    const rows = await bookingDb<Booking[]>(`kpl_booking_requests?id=eq.${encodeURIComponent(id)}&select=*`);
    const quote = rows[0];
    if (!quote || !['quoted','checkout'].includes(quote.status)) throw new Error('Only unpaid holds can be released.');
    if (quote.stripe_session_id) {
      const session = await stripeRequest<{ status: string; payment_status: string }>(`checkout/sessions/${encodeURIComponent(quote.stripe_session_id)}`);
      if (session.status === 'open' && session.payment_status !== 'paid') {
        await stripeRequest(`checkout/sessions/${encodeURIComponent(quote.stripe_session_id)}/expire`, new URLSearchParams());
      } else if (session.status !== 'expired') throw new Error('Payment may have completed; reconcile Stripe before release.');
    }
    const released = await bookingDb<boolean>('rpc/kpl_release_quote', { method: 'POST', body: { p_id: id }, returnRows: true });
    if (!released) throw new Error('Hold could not be safely released.');
  } catch (error) {
    console.error('Could not release hold:', error instanceof BookingServiceError ? error.code : 'release-error');
    redirect('/owner/bookings?status=release-error');
  }
  redirect('/owner/bookings?status=released');
}

/** This records a correction already made; it never refunds or cancels a stay. */
export async function resolvePaymentProblem(form: FormData) {
  const cookie = (await cookies()).get(OWNER_COOKIE_NAME)?.value;
  if (!verifyOwnerSessionToken(cookie)) redirect('/owner/access?next=/owner/bookings');
  const id = String(form.get('id') ?? '');
  const note = String(form.get('note') ?? '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(id) || note.length < 3 || note.length > 500 || form.get('correction_done') !== 'yes') {
    redirect('/owner/bookings?status=resolve-error');
  }
  try {
    const result = await bookingClient().resolveReconciliation(id, note);
    if (result?.ok !== true) throw new Error('Not resolved');
  } catch { redirect('/owner/bookings?status=resolve-error'); }
  redirect('/owner/bookings?status=resolved');
}


export async function sendQuoteEmail(form: FormData) {
  const cookie = (await cookies()).get(OWNER_COOKIE_NAME)?.value;
  if (!verifyOwnerSessionToken(cookie)) {
    redirect('/owner/access?next=/owner/bookings');
  }

  const id = String(form.get('id') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    redirect('/owner/bookings?status=invalid');
  }

  let outcome = 'quote-sent';

  try {
    const quote = await bookingClient().get(id);

    if (!quote || quote.status !== 'quoted') {
      throw new BookingServiceError(409, 'not_open');
    }

    const ics = await fetchAirbnbIcs({ fresh: true });
    const nights = nightsBetween(quote.check_in, quote.check_out);

    if (airbnbStayStatus(ics, nights) !== 'owner-blocked') {
      throw new BookingServiceError(409, 'calendar_conflict');
    }

    const result = await bookingClient().sendQuote(id);

    if (result?.status !== 'sent' || result?.provider_accepted !== true) {
      outcome = 'quote-held';
    }
  } catch (error) {
    const code = error instanceof BookingServiceError
      ? error.code
      : 'quote-email-error';

    console.error('Could not send quote:', code);
    outcome = code;
  }

  redirect(`/owner/bookings?status=${encodeURIComponent(outcome)}`);
}
