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
    const reques¶»§q«^