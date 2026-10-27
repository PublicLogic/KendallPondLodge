import { createHmac, timingSafeEqual } from 'node:crypto';
import { BookingServiceError, UUID } from './pj-booking-client.mjs';
const SESSION = /^cs_(test|live)_[A-Za-z0-9]{8,200}$/;
export function stayNights(a, b) { const ms = s => { if (!/^\d{4}-\d{2}-\d{2}$/.test(s))
    throw new BookingServiceError(422, 'invalid_request'); const n = Date.parse(s + 'T00:00:00Z'); if (!Number.isFinite(n) || new Date(n).toISOString().slice(0, 10) !== s)
    throw new BookingServiceError(422, 'invalid_request'); return n; }; const n = (ms(b) - ms(a)) / 86400000; if (!Number.isInteger(n) || n < 1 || n > 30)
    throw new BookingServiceError(422, 'invalid_request'); return n; }
export function propertyToday(now = new Date()) { const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(v => [v.type, v.value])); return `${p.year}-${p.month}-${p.day}`; }
export function validateGuestRequest(raw, now = new Date()) {
    const check_in = String(raw.check_in ?? ''), check_out = String(raw.check_out ?? '');
    stayNights(check_in, check_out);
    const guest_name = String(raw.guest_name ?? '').trim(), guest_email = String(raw.guest_email ?? '').trim().toLowerCase(), note = String(raw.note ?? '').trim(), guests = Number(raw.guests), pets = Number(raw.pets);
    if (raw.website || raw.consent !== 'yes' || check_in <= propertyToday(now) || guest_name.length < 2 || guest_name.length > 100 || guest_email.length > 254 || !/^\S+@[^\s@]+\.[^\s@]+$/.test(guest_email) || note.length > 1000 || !Number.isInteger(guests) || guests < 1 || guests > 8 || !Number.isInteger(pets) || pets < 0 || pets > 2)
        throw new BookingServiceError(422, 'invalid_request');
    if (Object.hasOwn(raw, 'request_key') && (typeof raw.request_key !== 'string' || !UUID.test(raw.request_key)))
        throw new BookingServiceError(422, 'invalid_request');
    return { check_in, check_out, guest_name, guest_email, guests, pets, note,
        ...(Object.hasOwn(raw, 'request_key') ? { request_key: raw.request_key.toLowerCase() } : {}) };
}
export function publicBookingState(q, payment = '') {
    if (q.refund_reason)
        return 'refund_review';
    if (q.status === 'confirmed')
        return q.paid_at && !q.reservation_sync_error ? 'confirmed' : 'needs_attention';
    if (payment === 'return' || q.stripe_session_id || q.status === 'checkout')
        return 'checking';
    if (q.status === 'expired' || q.status === 'declined' || !q.quote_expires || Date.parse(q.quote_expires) <= Date.now() + 65 * 60000)
        return 'expired';
    return 'quote';
}
function safeOrigin(value) { let u; try {
    u = new URL(value);
}
catch {
    throw new BookingServiceError(503, 'not_configured');
} ; if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash || u.pathname !== '/')
    throw new BookingServiceError(503, 'not_configured'); return u.origin; }
function checkoutUrl(value) { let u; try {
    u = new URL(value);
}
catch {
    throw new BookingServiceError(503, 'invalid_response');
} ; if (u.protocol !== 'https:' || u.hostname !== 'checkout.stripe.com' || u.port || u.username || u.password)
    throw new BookingServiceError(503, 'invalid_response'); return u.href; }
export async function beginGuestCheckout({ token, accepted, pj, stripe, origin }) {
    if (!UUID.test(token))
        throw new BookingServiceError(422, 'invalid_request');
    if (!accepted)
        throw new BookingServiceError(422, 'acceptance_required');
    const base = safeOrigin(origin);
    const q = await pj.beginCheckout(token);
    if (!q || !UUID.test(q.id) || !Number.isSafeInteger(q.deposit_cents) || q.deposit_cents < 1 || !Number.isSafeInteger(q.total_cents) || q.deposit_cents > q.total_cents)
        throw new BookingServiceError(503, 'invalid_response');
    let session;
    if (q.stripe_session_id) {
        if (!SESSION.test(q.stripe_session_id))
            throw new BookingServiceError(503, 'invalid_response');
        session = await stripe(`checkout/sessions/${encodeURIComponent(q.stripe_session_id)}`);
        if (session?.id !== q.stripe_session_id)
            throw new BookingServiceError(503, 'invalid_response');
        if (session.status === 'complete' || session.payment_status === 'paid')
            return { kind: 'checking', url: `${base}/book/quote/${token}?payment=return` };
        if (session.status !== 'open')
            throw new BookingServiceError(409, 'checkout_closed');
    }
    else {
        const started = Date.parse(q.checkout_started_at), expires = Math.floor(started / 1000) + 3600;
        if (!Number.isFinite(started) || expires < Math.floor(Date.now() / 1000) + 30 * 60)
            throw new BookingServiceError(409, 'checkout_closed');
        const form = new URLSearchParams({ mode: 'payment', 'payment_method_types[0]': 'card', customer_email: q.guest_email, 'line_items[0][price_data][currency]': 'usd', 'line_items[0][price_data][unit_amount]': String(q.deposit_cents), 'line_items[0][price_data][product_data][name]': 'Lodge at Kendall Pond booking deposit', 'line_items[0][price_data][product_data][description]': `${q.check_in} to ${q.check_out}. Balance and terms as shown on your accepted quote.`, 'line_items[0][quantity]': '1', 'metadata[booking_request_id]': q.id, 'metadata[kpl_booking_id]': q.id, 'payment_intent_data[metadata][booking_request_id]': q.id, success_url: `${base}/book/quote/${token}?payment=return`, cancel_url: `${base}/book/quote/${token}?payment=cancel`, expires_at: String(expires) });
        session = await stripe('checkout/sessions', form, `kpl-deposit-${q.id}`);
        if (!SESSION.test(session?.id ?? ''))
            throw new BookingServiceError(503, 'invalid_response');
        // A timeout is ambiguous: never expire a session that PJ may have attached.
        const attached = await pj.attachCheckout(q.id, session.id);
        if (attached?.ok !== true) {
            try {
                await stripe(`checkout/sessions/${encodeURIComponent(session.id)}/expire`, new URLSearchParams());
            }
            catch { }
            throw new BookingServiceError(409, 'attach_failed');
        }
    }
    return { kind: 'redirect', url: checkoutUrl(session.url) };
}
export function verifyPaymentSignature(body, header, secret, now = Math.floor(Date.now() / 1000)) {
    if (typeof header !== 'string' || !secret)
        return false;
    const timestamp = Number(header.match(/(?:^|,)\s*t=(\d+)(?=,|$)/)?.[1]);
    if (!Number.isSafeInteger(timestamp) || Math.abs(now - timestamp) > 300)
        return false;
    const expected = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest();
    return [...header.matchAll(/(?:^|,)\s*v1=([a-f0-9]{64})(?=,|$)/g)].some(m => { const b = Buffer.from(m[1], 'hex'); return b.length === expected.length && timingSafeEqual(b, expected); });
}
/** @returns {Promise<{status:number,body:Record<string,unknown>,outcome?:string}>} */
export async function handlePaymentWebhook({ body, signature, env, pj }) {
    const answer = (status, code) => ({ status, body: status === 200 ? { received: true } : { error: code } });
    if (!env.STRIPE_WEBHOOK_SECRET || !env.STRIPE_SECRET_KEY)
        return answer(503, 'not_configured');
    if (Buffer.byteLength(body, 'utf8') > 200000 || !verifyPaymentSignature(body, signature, env.STRIPE_WEBHOOK_SECRET))
        return answer(400, 'invalid_signature');
    let e;
    try {
        e = JSON.parse(body);
    }
    catch {
        return answer(400, 'invalid_payload');
    }
    if (!e || typeof e !== 'object')
        return answer(400, 'invalid_payload');
    if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(e.type))
        return answer(200);
    const s = e.data?.object, meta = s?.metadata;
    // An unrelated product on the same Stripe account is not a KPL booking.
    if (!meta?.booking_request_id && !meta?.kpl_booking_id)
        return answer(200);
    const id = meta.booking_request_id || meta.kpl_booking_id;
    if (meta.booking_request_id && meta.kpl_booking_id && meta.booking_request_id !== meta.kpl_booking_id)
        return answer(503, 'reconciliation_required');
    const live = /^(sk|rk)_live_/.test(env.STRIPE_SECRET_KEY);
    if (!/^(sk|rk)_(test|live)_/.test(env.STRIPE_SECRET_KEY) || typeof e.livemode !== 'boolean' || e.livemode !== live || typeof s?.id !== 'string' || s.id.startsWith('cs_live_') !== live)
        return answer(400, 'mode_mismatch');
    if (s.payment_status !== 'paid')
        return answer(200);
    if (s.object !== 'checkout.session' || s.currency !== 'usd' || !UUID.test(id) || !SESSION.test(s.id) || !Number.isSafeInteger(s.amount_total) || s.amount_total < 1)
        return answer(503, 'reconciliation_required');
    try {
        const r = await pj.confirmPayment(id, s.id, s.amount_total);
        if (typeof r?.ok !== 'boolean')
            return answer(503, 'invalid_response');
        return { ...answer(200), outcome: r.ok ? 'confirmed' : r.refund_required ? 'refund_required' : r.rejected ? 'rejected' : 'unmatched' };
    }
    catch {
        return answer(503, 'reservation_pending');
    }
}
