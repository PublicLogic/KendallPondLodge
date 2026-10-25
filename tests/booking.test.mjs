import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { stayNights, quoteAmounts, verifyStripeSignature, propertyToday, quoteHasPaymentWindow } from '../lib/booking.mjs';

test('dates use exclusive checkout and reject malformed or excessive stays', () => {
  assert.equal(stayNights('2026-12-31', '2027-01-02'), 2);
  assert.throws(() => stayNights('2026-02-30', '2026-03-02'));
  assert.throws(() => stayNights('2026-10-01', '2026-10-01'));
  assert.throws(() => stayNights('2026-10-01', '2026-12-01'));
});

test('arrival dates use Gardner local day across UTC and daylight-saving boundaries', () => {
  assert.equal(propertyToday(new Date('2026-09-27T00:30:00Z')), '2026-09-26');
  assert.equal(propertyToday(new Date('2026-12-27T02:30:00Z')), '2026-12-26');
});

test('quote includes every item and enforces a bounded deposit', () => {
  assert.deepEqual(quoteAmounts({ nights: 3, nightly: 25000, cleaning: 15000, pet: 5000, tax: 11500, other: 0, deposit: 25000 }), { lodging: 75000, total: 106500, balance: 81500 });
  assert.throws(() => quoteAmounts({ nights: 2, nightly: 10000, cleaning: 0, pet: 0, tax: 0, other: 0, deposit: 30000 }));
});

test('owner cannot send a quote when its guest payment window has closed', () => {
  const now = Date.parse('2026-09-26T20:00:00Z');
  assert.equal(quoteHasPaymentWindow(null, now), false);
  assert.equal(quoteHasPaymentWindow(new Date(now + 65 * 60_000).toISOString(), now), false);
  assert.equal(quoteHasPaymentWindow(new Date(now + 66 * 60_000).toISOString(), now), true);
});

test('Stripe signature checks timestamp and original payload with constant-time comparison', () => {
  const body = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' });
  const secret = 'whsec_test';
  const now = Math.floor(Date.now() / 1000);
  const valid = createHmac('sha256', secret).update(`${now}.${body}`).digest('hex');
  assert.equal(verifyStripeSignature(body, `t=${now},v1=${valid}`, secret), true);
  assert.equal(verifyStripeSignature(body + ' ', `t=${now},v1=${valid}`, secret), false);
  assert.equal(verifyStripeSignature(body, `t=${now - 600},v1=${valid}`, secret), false);
});

