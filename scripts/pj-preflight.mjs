/** Read-only check. No bookings, payments, sessions or settings are created. */
import { PjBookingClient, bookingBase } from '../lib/pj-booking-client.mjs';
const checks = [];
const check = (name, ok, detail = '') => { checks.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'CHECK'} ${name}${detail ? ' — ' + detail : ''}`); };
let client;
try {
    client = new PjBookingClient({ baseUrl: process.env.KPL_STORE_URL ?? '', key: process.env.KPL_STORE_KEY ?? '', allowLocal: process.env.NODE_ENV !== 'production' && process.env.KPL_ALLOW_LOCAL_PJ === 'true' });
    check('PJ address and server key', true);
}
catch {
    check('PJ address and server key', false, 'Set KPL_STORE_URL to the full booking API path and KPL_STORE_KEY to its scoped opaque key.');
}
check('Owner code hash', /^[a-f0-9]{64}$/i.test(process.env.KPL_OWNER_CODE_HASH ?? ''));
check('Owner session signing key', (process.env.KPL_OWNER_SESSION_TOKEN ?? '').trim().length >= 32);
check('Stripe server key', /^(sk|rk)_(test|live)_/.test(process.env.STRIPE_SECRET_KEY ?? ''));
check('Stripe webhook secret', Boolean(process.env.STRIPE_WEBHOOK_SECRET));
try {
    const u = new URL(process.env.KPL_BOOKING_ORIGIN ?? '');
    check('Public booking origin', u.protocol === 'https:' && !u.username && !u.password && !u.search && !u.hash && u.pathname === '/');
}
catch {
    check('Public booking origin', false);
}
check('KPL calendar source', Boolean(process.env.KPL_AIRBNB_ICAL_URL?.trim()), 'URL is never printed.');
check('Public direct requests explicitly enabled', process.env.KPL_DIRECT_BOOKING_ENABLED === 'true', 'This check does not change the switch.');
if (client) {
    try {
        const s = await client.contentStatus();
        check('PJ content connection', true);
        check('Calendar registered in PJ', s.calendarConfigured === true, 'This does not prove calendar freshness or property provisioning.');
    }
    catch (e) {
        check('PJ content connection', false, e.code ?? 'unavailable');
    }
    try {
        const a = await client.attention();
        check('PJ booking/reconciliation connection', Array.isArray(a.items));
    }
    catch (e) {
        check('PJ booking/reconciliation connection', false, e.code ?? 'unavailable');
    }
}
console.log('Not checked: live property row, actual calendar read, Stripe account/webhook pairing, complete checkout rehearsal, emails, cancellations or refunds.');
process.exitCode = checks.every(c => c.ok) ? 0 : 1;
