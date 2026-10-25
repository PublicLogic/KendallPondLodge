import { createHmac, timingSafeEqual } from 'node:crypto';

export function propertyToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const byType = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function dateMilliseconds(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Enter dates in YYYY-MM-DD format.');
  const [year, month, day] = value.split('-').map(Number);
  const ms = Date.UTC(year, month - 1, day);
  if (new Date(ms).toISOString().slice(0, 10) !== value) throw new Error('Enter a valid date.');
  return ms;
}

export function stayNights(checkIn, checkOut) {
  const nights = (dateMilliseconds(checkOut) - dateMilliseconds(checkIn)) / 86400000;
  if (!Number.isInteger(nights) || nights < 1 || nights > 30) throw new Error('Choose a stay of 1–30 nights.');
  return nights;
}

/** Lists each stayed night as YYYY-MM-DD, checkout day excluded (matches stayNights' exclusive-checkout rule). */
export function nightsBetween(checkIn, checkOut) {
  const total = stayNights(checkIn, checkOut);
  const nights = [];
  const start = dateMilliseconds(checkIn);
  for (let i = 0; i < total; i += 1) nights.push(new Date(start + i * 86400000).toISOString().slice(0, 10));
  return nights;
}

/** Match the guest checkout's 65-minute minimum remaining payment window. */
export function quoteHasPaymentWindow(expires, now = Date.now()) {
  return Boolean(expires) && Date.parse(expires) > now + 65 * 60_000;
}

export function quoteAmounts({ nights, nightly, cleaning, pet, tax, other, deposit }) {
  for (const amount of [nightly, cleaning, pet, tax, other, deposit]) {
    if (!Number.isSafeInteger(amount) || amount < 0) throw new Error('Enter whole, nonnegative cent amounts.');
  }
  if (!Number.isInteger(nights) || nights < 1 || nights > 30 || nightly < 1) throw new Error('Invalid nightly quote.');
  const lodging = nights * nightly;
  const total = lodging + cleaning + pet + tax + other;
  if (!Number.isSafeInteger(total) || total > 99999999 || deposit < 1 || deposit > total) throw new Error('Deposit must be between $0.01 and the quoted total.');
  return { lodging, total, balance: total - deposit };
}

export function verifyStripeSignature(body, header, secret, now = Math.floor(Date.now() / 1000)) {
  const timestamp = Number(header?.match(/(?:^|,)t=(\d+)(?:,|$)/)?.[1]);
  if (!Number.isSafeInteger(timestamp) || Math.abs(now - timestamp) > 300 || !secret) return false;
  const digest = Buffer.from(createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex'), 'ascii');
  return [...header.matchAll(/(?:^|,)v1=([a-f0-9]{64})(?=,|$)/g)].some((match) => {
    const candidate = Buffer.from(match[1], 'ascii');
    return candidate.length === digest.length && timingSafeEqual(candidate, digest);
  });
}
