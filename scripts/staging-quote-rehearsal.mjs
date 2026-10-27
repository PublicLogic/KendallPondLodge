import fs from 'node:fs';
import path from 'node:path';
import { PjBookingClient, BookingServiceError } from '../lib/pj-booking-client.mjs';

const client = new PjBookingClient({
  baseUrl: process.env.KPL_STORE_URL ?? '',
  key: process.env.KPL_STORE_KEY ?? '',
  timeoutMs: 10000,
});

const rows = await client.list(100);
const booking = rows.find((row) =>
  row?.check_in === '2026-11-03' &&
  row?.check_out === '2026-11-05' &&
  row?.guest_email === 'staging-booking@publiclogic.org'
);

if (!booking?.id) throw new Error('staging quote rehearsal failed: request not found');

let quoted = booking;
if (booking.status === 'requested') {
  await client.issueQuote(booking.id, {
    nightly_cents: 20000,
    cleaning_cents: 10000,
    pet_cents: 0,
    tax_cents: 0,
    other_cents: 0,
    other_label: null,
    deposit_cents: 10000,
    total_cents: 50000,
    cancellation_terms: 'Staging rehearsal only; no real guest or payment.',
    balance_terms: 'Staging rehearsal only; remaining balance is not collectible.',
    quote_expires: '2026-10-30T23:00:00.000Z',
  });
  quoted = await client.get(booking.id);
}

if (!quoted || quoted.status !== 'quoted') {
  throw new Error('staging quote rehearsal failed: quote was not created');
}

let sendBlocked = false;
try {
  await client.sendQuote(booking.id);
} catch (e) {
  if (e instanceof BookingServiceError && e.status === 409 && e.code === 'calendar_conflict') {
    sendBlocked = true;
  } else {
    throw e;
  }
}
if (!sendBlocked) throw new Error('staging quote rehearsal failed: send-quote was not blocked by Airbnb owner-block gate');

let checkoutBlocked = false;
try {
  await client.beginCheckout(quoted.quote_token);
} catch (e) {
  if (e instanceof BookingServiceError && e.status === 409 && e.code === 'calendar_conflict') {
    checkoutBlocked = true;
  } else {
    throw e;
  }
}
if (!checkoutBlocked) throw new Error('staging quote rehearsal failed: checkout was not blocked by Airbnb owner-block gate');

const messaging = await client.messageStatus();
if (messaging?.readiness?.enabled !== false) {
  throw new Error('staging quote rehearsal failed: messaging unexpectedly enabled');
}

const proof = {
  proof: 'kpl-staging-quote-owner-block-gate',
  dates: { checkIn: quoted.check_in, checkOut: quoted.check_out },
  bookingStatus: quoted.status,
  totalCents: quoted.total_cents,
  depositCents: quoted.deposit_cents,
  sendQuoteBlockedUntilOwnerBlock: sendBlocked,
  checkoutBlockedUntilOwnerBlock: checkoutBlocked,
  messagingEnabled: false,
  generatedAt: new Date().toISOString(),
};

fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });
fs.writeFileSync(
  path.join(process.cwd(), 'public', '_staging-quote-proof.json'),
  JSON.stringify(proof, null, 2) + '\n',
  'utf8',
);

console.log('[staging-quote] quote issuance PASS');
console.log('[staging-quote] Airbnb owner-block gate PASS');
console.log('[staging-quote] messaging disabled PASS');
