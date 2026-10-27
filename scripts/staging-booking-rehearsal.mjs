import fs from 'node:fs';
import path from 'node:path';
import { PjBookingClient } from '../lib/pj-booking-client.mjs';

const client = new PjBookingClient({
  baseUrl: process.env.KPL_STORE_URL ?? '',
  key: process.env.KPL_STORE_KEY ?? '',
  timeoutMs: 10000,
});

const input = {
  check_in: '2026-11-03',
  check_out: '2026-11-05',
  guest_name: 'KPL Staging Guest',
  guest_email: 'staging-booking@publiclogic.org',
  guests: 2,
  pets: 0,
  note: 'Automated staging rehearsal. No real guest.',
  request_key: '9c3c7f8b-2f7e-4e19-a4b8-7d0d6f0f1a27',
};

const first = await client.createRequest(input);
const second = await client.createRequest(input);

if (!first?.id || first.id !== second?.id) {
  throw new Error('staging rehearsal failed: retry did not resolve to one request');
}
if (first.status !== 'requested' || second.status !== 'requested') {
  throw new Error('staging rehearsal failed: request status is not requested');
}

const list = await client.list(100);
const matches = Array.isArray(list) ? list.filter((row) => row?.id === first.id) : [];
if (matches.length !== 1) {
  throw new Error('staging rehearsal failed: booking list did not contain exactly one request');
}

const attention = await client.attention();
const attentionItems = Array.isArray(attention?.items) ? attention.items : [];
const attentionHit = attentionItems.some((row) =>
  row?.id === first.id || row?.booking_id === first.id || row?.booking_request_id === first.id
);
if (!attentionHit) {
  throw new Error('staging rehearsal failed: request is not in owner attention');
}

const messaging = await client.messageStatus();
if (messaging?.readiness?.enabled !== false) {
  throw new Error('staging rehearsal failed: messaging unexpectedly enabled');
}
const states = messaging?.bookings?.[first.id] ?? {};
if (states.request_guest?.status !== 'held') {
  throw new Error('staging rehearsal failed: guest request message is not held');
}
if (states.request_owner?.status !== 'held') {
  throw new Error('staging rehearsal failed: owner request message is not held');
}

const proof = {
  proof: 'kpl-staging-request-retry',
  dates: { checkIn: input.check_in, checkOut: input.check_out },
  retryReturnedSameRequest: true,
  bookingListContainsExactlyOne: true,
  status: first.status,
  ownerAttentionContainsRequest: true,
  messagingEnabled: false,
  guestRequestMessage: states.request_guest.status,
  ownerRequestMessage: states.request_owner.status,
  generatedAt: new Date().toISOString(),
};

fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });
fs.writeFileSync(
  path.join(process.cwd(), 'public', '_staging-booking-proof.json'),
  JSON.stringify(proof, null, 2) + '\n',
  'utf8',
);

console.log('[staging-booking] retry idempotency PASS');
console.log('[staging-booking] owner attention PASS');
console.log('[staging-booking] held messaging PASS');
