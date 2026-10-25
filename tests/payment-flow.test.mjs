import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { handlePaymentWebhook, beginGuestCheckout, publicBookingState } from '../lib/kpl-booking-core.mjs';
const id = '10000000-0000-4000-8000-000000000001', token = '20000000-0000-4000-8000-000000000002', sid = 'cs_test_1234567890';
const env = { STRIPE_WEBHOOK_SECRET: 'whsec_local_test_only', STRIPE_SECRET_KEY: 'sk_test_not_a_credential' };
const event = () => ({ id: 'evt_test_1', livemode: false, type: 'checkout.session.completed', data: { object: { object: 'checkout.session', id: sid, metadata: { kpl_booking_id: id }, payment_status: 'paid', currency: 'usd', amount_total: 12345 } } });
function signed(e, config = env) { const body = JSON.stringify(e), t = Math.floor(Date.now() / 1000), signature = `t=${t},v1=${createHmac('sha256', config.STRIPE_WEBHOOK_SECRET).update(`${t}.${body}`).digest('hex')}`; return { body, signature, env: config }; }
for (const result of [{ ok: true }, { ok: false, refund_required: true, reason: 'paid_conflict' }, { ok: false, rejected: 'amount_mismatch' }, { ok: false }])
    test(`durable 200 PJ result acknowledged: ${JSON.stringify(result)}`, async () => { let called = 0; const r = await handlePaymentWebhook({ ...signed(event()), pj: { confirmPayment: async (...a) => { called++; assert.deepEqual(a, [id, sid, 12345]); return result; } } }); assert.equal(r.status, 200); assert.equal(called, 1); assert.equal(r.outcome, result.ok ? 'confirmed' : result.refund_required ? 'refund_required' : result.rejected ? 'rejected' : 'unmatched'); });
test('PJ throw asks Stripe to retry', async () => { assert.equal((await handlePaymentWebhook({ ...signed(event()), pj: { confirmPayment: async () => { throw new Error('unreachable'); } } })).status, 503); });
test('forged signature fails before any PJ mutation', async () => { let called = 0; assert.equal((await handlePaymentWebhook({ ...signed(event()), signature: 't=1,v1=' + '0'.repeat(64), pj: { confirmPayment: async () => { called++; } } })).status, 400); assert.equal(called, 0); });
test('unrelated/unpaid events acknowledged without mutation', async () => { for (const change of [e => { e.type = 'other'; }, e => { e.data.object.metadata = {}; }, e => { e.data.object.payment_status = 'unpaid'; }]) {
    const e = event();
    change(e);
    let called = 0;
    const r = await handlePaymentWebhook({ ...signed(e), pj: { confirmPayment: async () => called++ } });
    assert.equal(r.status, 200);
    assert.equal(called, 0);
} });
test('restricted live keys have live mode; mismatched modes rejected', async () => { const e = event(); e.livemode = true; e.data.object.id = 'cs_live_1234567890'; const config = { ...env, STRIPE_SECRET_KEY: 'rk_live_not_a_credential' }; assert.equal((await handlePaymentWebhook({ ...signed(e, config), pj: { confirmPayment: async () => ({ ok: true }) } })).status, 200); assert.equal((await handlePaymentWebhook({ ...signed(e), pj: { confirmPayment: async () => ({ ok: true }) } })).status, 400); });
test('inconsistent metadata or invalid amount is not confirmed', async () => { for (const change of [e => e.data.object.metadata.booking_request_id = token, e => e.data.object.amount_total = 12.3, e => e.data.object.currency = 'eur']) {
    const e = event();
    change(e);
    let called = 0;
    assert.equal((await handlePaymentWebhook({ ...signed(e), pj: { confirmPayment: async () => called++ } })).status, 503);
    assert.equal(called, 0);
} });
function quote() { return { id, quote_token: token, status: 'checkout', deposit_cents: 12345, total_cents: 50000, guest_email: 'guest@example.test', check_in: '2027-01-02', check_out: '2027-01-04', checkout_started_at: new Date().toISOString(), stripe_session_id: null }; }
test('checkout amount comes from PJ and attachment precedes redirect', async () => { const q = quote(), order = []; let form; const result = await beginGuestCheckout({ token, accepted: true, origin: 'https://lodge.example', pj: { beginCheckout: async () => { order.push('begin'); return q; }, attachCheckout: async () => { order.push('attach'); return { ok: true }; } }, stripe: async (path, f, key) => { order.push('stripe'); form = f; assert.equal(key, `kpl-deposit-${id}`); return { id: sid, url: 'https://checkout.stripe.com/c/pay/example', status: 'open' }; } }); assert.deepEqual(order, ['begin', 'stripe', 'attach']); assert.equal(form.get('line_items[0][price_data][unit_amount]'), '12345'); assert.equal(result.kind, 'redirect'); });
test('retry reuses an attached session instead of charging twice', async () => { const q = { ...quote(), stripe_session_id: sid }; const paths = []; await beginGuestCheckout({ token, accepted: true, origin: 'https://lodge.example', pj: { beginCheckout: async () => q, attachCheckout: async () => assert.fail() }, stripe: async (p) => { paths.push(p); return { id: sid, url: 'https://checkout.stripe.com/c/pay/existing', status: 'open', payment_status: 'unpaid' }; } }); assert.deepEqual(paths, [`checkout/sessions/${sid}`]); });
test('complete checkout returns to checking, never declares booked', async () => { const result = await beginGuestCheckout({ token, accepted: true, origin: 'https://lodge.example', pj: { beginCheckout: async () => ({ ...quote(), stripe_session_id: sid }) }, stripe: async () => ({ id: sid, status: 'complete', payment_status: 'paid' }) }); assert.equal(result.kind, 'checking'); });
test('explicit attachment rejection expires new session; ambiguous failure does not', async () => { for (const ambiguous of [false, true]) {
    const paths = [];
    await assert.rejects(beginGuestCheckout({ token, accepted: true, origin: 'https://lodge.example', pj: { beginCheckout: async () => quote(), attachCheckout: async () => { if (ambiguous)
                throw new Error('timeout'); return { ok: false }; } }, stripe: async (p) => { paths.push(p); return { id: sid, url: 'https://checkout.stripe.com/c/pay/new' }; } }));
    assert.equal(paths.some(p => p.endsWith('/expire')), !ambiguous);
} });
test('guest state does not turn redirect, refund, or missing reservation into success', () => { assert.equal(publicBookingState({ ...quote(), status: 'quoted', quote_expires: '2099-01-01T00:00:00Z' }, 'return'), 'checking'); assert.equal(publicBookingState({ ...quote(), status: 'confirmed', paid_at: '2026-01-01', reservation_sync_error: 'conflict' }), 'needs_attention'); assert.equal(publicBookingState({ ...quote(), status: 'confirmed', paid_at: '2026-01-01', refund_reason: 'paid_conflict' }), 'refund_review'); assert.equal(publicBookingState({ ...quote(), status: 'confirmed', paid_at: '2026-01-01', reservation_sync_error: null }), 'confirmed'); });
