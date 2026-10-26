/**
 * PJ booking API transport. Server-only in Next via booking-db.ts.
 * No credentials or guest data are included in error messages.
 */
export class BookingServiceError extends Error {
    constructor(status = 503, code = 'service_unavailable', correlationId = '') {
        super('The booking service could not complete this request.');
        this.name = 'BookingServiceError';
        this.status = status;
        this.code = code;
        this.correlationId = correlationId;
    }
}
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function bookingBase(value, allowLocal = false) {
    let url;
    try {
        url = new URL(value);
    }
    catch {
        throw new BookingServiceError(503, 'not_configured');
    }
    const local = allowLocal && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && url.protocol === 'http:';
    if ((url.protocol !== 'https:' && !local) || url.username || url.password || url.search || url.hash ||
        url.pathname.replace(/\/+$/, '') !== '/api/stayos/booking') {
        throw new BookingServiceError(503, 'not_configured');
    }
    return url.origin + '/api/stayos/booking';
}
function identifier(id) {
    if (typeof id !== 'string' || !UUID.test(id))
        throw new BookingServiceError(422, 'invalid_request');
    return id;
}
export class PjBookingClient {
    /** @param {{baseUrl:string,key:string,fetchImpl?:typeof fetch,allowLocal?:boolean,timeoutMs?:number}} config */
    constructor({ baseUrl, key, fetchImpl = globalThis.fetch, allowLocal = false, timeoutMs = 10000 }) {
        this.base = bookingBase(baseUrl, allowLocal);
        if (typeof key !== 'string' || key.length < 32 || key.length > 4096 || /\s/.test(key)) {
            throw new BookingServiceError(503, 'not_configured');
        }
        this.key = key;
        this.fetch = fetchImpl;
        this.timeoutMs = timeoutMs;
    }
    /** @param {string} path @param {{method?:string,body?:any}} options */
    async request(path, { method = 'GET', body } = {}) {
        if (!/^\/booking-requests(?:\/[a-zA-Z0-9/-]+)?(?:\?limit=\d{1,3})?$/.test(path) || path.includes('..') ||
            !['GET', 'POST'].includes(method))
            throw new BookingServiceError(400, 'invalid_route');
        return this.send(this.base + path, method, body);
    }
    async send(url, method, body) {
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${this.key}` };
        if (method !== 'GET')
            headers['X-PuddleJumper-Request'] = 'true';
        let response;
        try {
            response = await this.fetch(url, {
                method, headers, body: body === undefined ? undefined : JSON.stringify(body),
                cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(this.timeoutMs),
            });
        }
        catch {
            throw new BookingServiceError(503, 'service_unavailable');
        }
        let payload;
        try {
            payload = await response.json();
        }
        catch {
            throw new BookingServiceError(503, 'invalid_response');
        }
        if (!response.ok || payload?.success !== true) {
            const code = typeof payload?.error === 'string' && /^[a-z0-9_]{1,80}$/.test(payload.error)
                ? payload.error : 'service_unavailable';
            const correlation = typeof payload?.correlationId === 'string' && UUID.test(payload.correlationId) ? payload.correlationId : '';
            throw new BookingServiceError(response.ok ? 503 : response.status, code, correlation);
        }
        if (!Object.hasOwn(payload, 'data'))
            throw new BookingServiceError(503, 'invalid_response');
        return payload.data;
    }
    createRequest(input) { return this.request('/booking-requests', { method: 'POST', body: input }); }
    async findQuote(token) {
        if (typeof token !== 'string' || !UUID.test(token))
            return null;
        try {
            return await this.request('/booking-requests/lookup', { method: 'POST', body: { quote_token: token } });
        }
        catch (error) {
            if (error.status === 404)
                return null;
            throw error;
        }
    }
    list(limit = 100) {
        if (!Number.isInteger(limit) || limit < 1 || limit > 100)
            throw new BookingServiceError(422, 'invalid_request');
        return this.request(`/booking-requests?limit=${limit}`);
    }
    async get(id) {
        try {
            return await this.request(`/booking-requests/${identifier(id)}`);
        }
        catch (error) {
            if (error.status === 404)
                return null;
            throw error;
        }
    }
    issueQuote(id, input) { return this.request(`/booking-requests/${identifier(id)}/quote`, { method: 'POST', body: input }); }
    beginCheckout(token) { return this.request('/booking-requests/begin-checkout', { method: 'POST', body: { quote_token: identifier(token) } }); }
    attachCheckout(id, session) { return this.request(`/booking-requests/${identifier(id)}/attach-checkout`, { method: 'POST', body: { stripe_session_id: session } }); }
    confirmPayment(id, session, amount) { return this.request(`/booking-requests/${identifier(id)}/confirm-payment`, { method: 'POST', body: { stripe_session_id: session, amount_cents: amount } }); }
    release(id) { return this.request(`/booking-requests/${identifier(id)}/release`, { method: 'POST' }); }
    attention() { return this.request('/booking-requests/attention'); }
    messageStatus() { return this.request('/booking-requests/message-status'); }
    sendQuote(id) { return this.request(`/booking-requests/${identifier(id)}/send-quote`, { method: 'POST' }); }
    resolveReconciliation(id, note) { return this.request(`/booking-requests/${identifier(id)}/reconciliation/resolve`, { method: 'POST', body: { note } }); }
    contentStatus() { return this.send(new URL('/api/stayos/content/status', this.base).href, 'GET'); }
    registerCalendar(url) { return this.send(new URL('/api/stayos/content/calendar-source', this.base).href, 'POST', { url }); }
}
/**
 * Compatibility for the small number of existing KPL call sites. This is a
 * closed operation map, NOT a PostgREST client. Nothing under /rest/v1 is sent.
 * Confirmation is deliberately unavailable here: callers must keep its structured outcome.
 * @param {PjBookingClient} client @param {string} path
 * @param {{method?:string,body?:any,returnRows?:boolean}} options
 */
export async function legacyBookingCall(client, path, { method = 'GET', body = {} } = {}) {
    if (path === 'rpc/kpl_confirm_payment')
        throw new Error('Payment confirmation requires the structured confirmPayment result.');
    if (path === 'kpl_booking_requests' && method === 'POST')
        return [await client.createRequest(body)];
    if (path.startsWith('kpl_booking_requests?') && method === 'GET') {
        const query = new URLSearchParams(path.slice('kpl_booking_requests?'.length));
        const keys = [...query.keys()];
        if (keys.some(key => !['id', 'quote_token', 'select', 'order', 'limit'].includes(key)) || new Set(keys).size !== keys.length) {
            throw new BookingServiceError(400, 'invalid_route');
        }
        if (query.has('id') || query.has('quote_token')) {
            if (query.has('id') && query.has('quote_token') || query.has('order') || query.has('limit'))
                throw new BookingServiceError(400, 'invalid_route');
            const value = query.get(query.has('id') ? 'id' : 'quote_token');
            if (!value?.startsWith('eq.') || !UUID.test(value.slice(3)))
                throw new BookingServiceError(400, 'invalid_route');
            const row = query.has('id') ? await client.get(value.slice(3)) : await client.findQuote(value.slice(3));
            return row ? [row] : [];
        }
        if (query.get('order') && query.get('order') !== 'created_at.desc')
            throw new BookingServiceError(400, 'invalid_route');
        const limit = query.get('limit') ?? '100';
        if (!/^\d{1,3}$/.test(limit))
            throw new BookingServiceError(400, 'invalid_route');
        const rows = await client.list(Number(limit));
        if (!Array.isArray(rows))
            throw new BookingServiceError(503, 'invalid_response');
        return rows;
    }
    if (method !== 'POST')
        throw new BookingServiceError(400, 'invalid_route');
    switch (path) {
        case 'rpc/kpl_issue_quote': {
            const result = await client.issueQuote(body.p_id, {
                nightly_cents: body.p_nightly, cleaning_cents: body.p_cleaning, pet_cents: body.p_pet,
                tax_cents: body.p_tax, other_cents: body.p_other, other_label: body.p_other_label,
                deposit_cents: body.p_deposit, total_cents: body.p_total,
                cancellation_terms: body.p_cancellation, balance_terms: body.p_balance, quote_expires: body.p_expires,
            });
            if (!UUID.test(result?.quote_token ?? ''))
                throw new BookingServiceError(503, 'invalid_response');
            return result.quote_token;
        }
        case 'rpc/kpl_begin_checkout': return [await client.beginCheckout(body.p_token)];
        case 'rpc/kpl_attach_checkout': return booleanOutcome(await client.attachCheckout(body.p_id, body.p_session));
        case 'rpc/kpl_release_quote': return booleanOutcome(await client.release(body.p_id));
        default: throw new BookingServiceError(400, 'invalid_route');
    }
}
function booleanOutcome(result) {
    if (typeof result?.ok !== 'boolean')
        throw new BookingServiceError(503, 'invalid_response');
    return result.ok;
}
export function publicError(code) {
    const messages = {
        calendar_unavailable: 'We can’t confirm these dates right now. Please try again later.',
        calendar_conflict: 'These dates cannot be booked right now. Please contact your hosts or choose another stay.',
        overlaps_reservation: 'These dates are not available. Please choose another stay.',
        overlapping_active_stay: 'Another stay is holding these dates. Please choose another stay.',
        not_eligible: 'This quote cannot be paid now. Please contact your hosts.',
        policy_violation: 'The quote needs host review before you can continue.',
        policy_reassessment_required: 'Your hosts need to review this quote before payment.',
        rate_limited: 'There have been several attempts. Please wait a moment before trying again.',
        invalid_request: 'Please check the dates, guest count, and contact details.',
        not_configured: 'Direct booking is not available right now.',
        checkout_closed: 'This payment session is closed. Please contact your hosts before paying again.',
        acceptance_required: 'Please accept the quote and terms before continuing.',
        message_unavailable: 'Email delivery is not available right now. The quote is still safe and can be sent later.',
        quote_expired: 'This quote is no longer open. Check the dates and issue a new quote.',
    };
    return messages[code] || 'We couldn’t confirm the result. Please contact your hosts before trying again.';
}
