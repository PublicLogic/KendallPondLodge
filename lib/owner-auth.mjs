import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export const OWNER_COOKIE_NAME = 'kpl-owner-session';
export const OWNER_SESSION_TTL_SECONDS = 12 * 60 * 60;
export class OwnerConfigError extends Error {
    constructor(name) { super(`${name} must be configured for owner access.`); this.name = 'OwnerConfigError'; }
}
export function getOwnerCodeHash() {
    const hash = process.env.KPL_OWNER_CODE_HASH?.trim();
    if (!hash || !/^[a-f0-9]{64}$/i.test(hash))
        throw new OwnerConfigError('KPL_OWNER_CODE_HASH');
    return hash.toLowerCase();
}
function signingKey() {
    const key = process.env.KPL_OWNER_SESSION_TOKEN?.trim();
    if (!key || key.length < 32)
        throw new OwnerConfigError('KPL_OWNER_SESSION_TOKEN (at least 32 characters)');
    return key;
}
function equal(a, b) {
    const left = Buffer.from(a, 'utf8'), right = Buffer.from(b, 'utf8');
    return left.length === right.length && timingSafeEqual(left, right);
}
export function hashOwnerCode(code) { return createHash('sha256').update(code, 'utf8').digest('hex'); }
export function verifyOwnerCode(code) {
    const expected = getOwnerCodeHash();
    return typeof code === 'string' && code.length <= 1024 && equal(hashOwnerCode(code), expected);
}
/** Same owner-code UX; the environment secret is a signing key, never the cookie. */
export function getOwnerSessionToken(nowMs = Date.now()) {
    const key = signingKey();
    const payload = Buffer.from(JSON.stringify({
        v: 1, iat: Math.floor(nowMs / 1000), exp: Math.floor(nowMs / 1000) + OWNER_SESSION_TTL_SECONDS,
        nonce: randomBytes(18).toString('base64url'), code: createHmac('sha256', key).update('owner-code:' + getOwnerCodeHash()).digest('base64url'),
    })).toString('base64url');
    return `${payload}.${createHmac('sha256', key).update(payload).digest('base64url')}`;
}
export function verifyOwnerSessionToken(token, nowMs = Date.now()) {
    if (!token)
        return false;
    const key = signingKey(), expectedCode = createHmac('sha256', key).update('owner-code:' + getOwnerCodeHash()).digest('base64url');
    if (typeof token !== 'string' || token.length > 1024 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token))
        return false;
    const [payload, signature] = token.split('.');
    if (!equal(signature, createHmac('sha256', key).update(payload).digest('base64url')))
        return false;
    try {
        const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        const now = Math.floor(nowMs / 1000);
        return value.v === 1 && Number.isSafeInteger(value.iat) && Number.isSafeInteger(value.exp) &&
            value.iat <= now + 60 && value.exp > now && value.exp - value.iat === OWNER_SESSION_TTL_SECONDS &&
            typeof value.nonce === 'string' && /^[A-Za-z0-9_-]{24}$/.test(value.nonce) && equal(value.code ?? '', expectedCode);
    }
    catch {
        return false;
    }
}
