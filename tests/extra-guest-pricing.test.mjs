import test from 'node:test';
import assert from 'node:assert/strict';
import { PjBookingClient } from '../lib/pj-booking-client.mjs';

const id = '11111111-1111-4111-8111-111111111111';
const token = '22222222-2222-4222-8222-222222222222';
const settings = {
  configured: true, enabled: true, airbnb_channel_guarded: true,
  base_nightly_cents: 12510, weekend_nightly_cents: 20519,
  cleaning_cents: 0, pet_fee_cents: 5000, pet_fee_mode: 'per_stay',
  tax_basis_points: 1170, taxable_fees: true, deposit_percent: 25,
  min_nights: 2, booking_window_days: 60, hold_minutes: 120,
  cancellation_terms: 'Full refund up to 30 days before arrival.',
  balance_terms: 'Balance due 14 days before arrival by card.',
};
const now = new Date('2026-11-01T12:00:00Z');
function harness(guests, overrides = {}, policy = {}) {
  const booking = { id, quote_token: token, status: 'requested', check_in: '2026-12-15', check_out: '2026-12-17', guests, pets: 0, ...overrides };
  const writes = [];
  const client = new PjBookingClient({baseUrl: 'https://pj.example/api/stayos/booking', key: 'x'.repeat(32), fetchImpl: async (url, init) => {
    const path = new URL(url).pathname;
    let data;
    if (path.endsWith('/instant-settings')) data = {...settings, ...policy};
    else if (path.endsWith('/' + id)) data = booking;
    else if (path.endsWith('/quote')) { writes.push(JSON.parse(init.body)); data = {quote_token: token}; }
    else if (path.endsWith('/auto-price')) { writes.push({total_cents:27947,deposit_cents:6987}); data = {quote_token:token}; }
    else throw new Error('Unexpected endpoint: ' + path);
    return new Response(JSON.stringify({success:true,data}), {status:200});
  }});
  return {client,writes};
}
for (const [guests, nightly, tax, total, deposit] of [
  [1,12510,2927,27947,6987], [2,12510,2927,27947,6987],
  [3,25380,5939,56699,14175], [4,38250,8951,85451,21363],
  [8,89730,20997,200457,50115],
]) {
  test(`${guests} guests: server quote includes nightly occupancy, tax and rounded deposit`, async () => {
    const {client,writes} = harness(guests);
    assert.deepEqual(await client.autoPrice(id, now), {quote_token:token});
    assert.equal(writes.length,1);
    assert.equal(writes[0].nightly_cents,nightly);
    assert.equal(writes[0].tax_cents,tax);
    assert.equal(writes[0].total_cents,total);
    assert.equal(writes[0].deposit_cents,deposit);
    assert.equal(writes[0].cleaning_cents,0);
    assert.equal(writes[0].quote_expires,'2026-11-01T14:00:00.000Z');
  });
}
test('extra guests apply to all nights, weekend adjustment and pets are counted once', async () => {
  const {client,writes} = harness(4,{check_in:'2026-12-03',check_out:'2026-12-06',pets:2});
  await client.autoPrice(id,now);
  assert.equal(writes[0].other_cents,16018);
  assert.equal(writes[0].pet_cents,5000);
  assert.equal(writes[0].tax_cents,15885);
  assert.equal(writes[0].total_cents,151653);
  assert.equal(writes[0].deposit_cents,37914);
});
for (const [label,booking,policy] of [
  ['disabled',{}, {enabled:false}], ['unguarded',{}, {airbnb_channel_guarded:false}],
  ['short stay',{check_out:'2026-12-16'},{}], ['outside window',{check_in:'2027-02-01',check_out:'2027-02-03'},{}],
  ['invalid count',{guests:9},{}], ['already quoted',{status:'quoted'},{}],
]) test(`${label} cannot issue an automatic quote`, async () => {
  const {client,writes} = harness(4,booking,policy);
  await assert.rejects(()=>client.autoPrice(id,now));
  assert.equal(writes.length,0);
});

test('checkout sends the guest-priced deposit to Stripe, not the two-person deposit', async () => {
  const {beginGuestCheckout} = await import('../lib/kpl-booking-core.mjs');
  const {client,writes} = harness(4);
  await client.autoPrice(id, now);
  let amount;
  await beginGuestCheckout({token,accepted:true,origin:'https://kendallpondlodge.com',
    pj: {beginCheckout:async()=>({id,...writes[0],guest_email:'test@example.com',check_in:'2026-12-15',check_out:'2026-12-17',checkout_started_at:new Date().toISOString()}),attachCheckout:async()=>({ok:true})},
    stripe: async (_path,form)=>{amount=form.get('line_items[0][price_data][unit_amount]');return {id:'cs_test_guestpricing12345',url:'https://checkout.stripe.com/c/pay/test'};},
  });
  assert.equal(amount,'21363');
});
