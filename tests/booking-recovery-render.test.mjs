import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { directQuote } from '../lib/direct-pricing.mjs';

const require = createRequire(import.meta.url);
const token = '20000000-0000-4000-8000-000000000002';
function compile(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  return new Function('exports', 'require', outputText + '\nreturn exports;');
}
const loadQuote = compile('../app/book/quote/[token]/page.tsx');
const loadPolicy = compile('../app/owner/settings/actions.ts');
const quote = {
  check_in: '2026-12-15', check_out: '2026-12-17', guests: 3, pets: 0,
  status: 'checkout', stripe_session_id: 'cs_test_fixture000001',
  quote_expires: '2020-01-01T00:00:00Z', nightly_cents: 25380, cleaning_cents: 0,
  pet_cents: 0, other_cents: 0, tax_cents: 5939, total_cents: 56699, deposit_cents: 14175,
  cancellation_terms: 'Fixture cancellation terms.', balance_terms: 'Fixture balance terms.',
};
async function renderQuote(overrides = {}, payment = '') {
  const imports = {
    'next/link': { default: 'a' },
    'next/navigation': { notFound: () => { throw new Error('not_found'); } },
    '@/lib/booking-db': {
      findQuote: async () => ({ ...quote, ...overrides }),
      directBookingEnabled: () => true, paymentConfigured: () => true,
      usd: cents => '$' + (cents / 100).toFixed(2), hostContactHref: () => 'https://hosts.example.test',
      publicError: () => 'Fixture error',
    },
    '@/app/book/actions': { payDeposit: '/fixture-payment-never-submitted' },
  };
  const page = loadQuote({}, name => Object.hasOwn(imports, name) ? imports[name]
    : require(name.startsWith('@/lib/') ? '../' + name.slice(2) : name)).default;
  return renderToStaticMarkup(await page({ params: Promise.resolve({ token }), searchParams: Promise.resolve({ payment }) }));
}

test('delayed checkout renders no expired warning, second payment or change-dates link', async () => {
  for (const payment of ['', 'return', 'cancel']) {
    const html = await renderQuote({}, payment);
    assert.match(html, /confirming your payment/);
    assert.match(html, /Don’t pay again/);
    assert.doesNotMatch(html, /has expired|Change dates|<form|Your stay is booked/);
  }
});
test('an authoritative cancellation renders a host-only recovery path rather than a 404', async () => {
  const html = await renderQuote({ status: 'declined' }, 'return');
  assert.match(html, /request was cancelled/);
  assert.match(html, /Contact Nate/);
  assert.doesNotMatch(html, /<form|Change dates|confirming your payment|has expired/);
});
test('expired unpaid quotes can change dates while paused open checkout can resume', async () => {
  const expired = await renderQuote({ status: 'quoted', stripe_session_id: null });
  assert.match(expired, /has expired/);
  assert.match(expired, /Change dates/);
  assert.doesNotMatch(expired, /<form/);
  const paused = await renderQuote({ quote_expires: '2099-01-01T00:00:00Z' }, 'cancel');
  assert.match(paused, /Checkout paused/);
  assert.match(paused, /Resume payment/);
  assert.match(paused, /<form/);
});
test('refund and reservation-attention pages never offer another payment or new dates', async () => {
  for (const [overrides, message] of [
    [{ refund_reason: 'paid_conflict' }, /refund review/],
    [{ status: 'confirmed', paid_at: '2026-11-27', reservation_sync_error: 'pending' }, /host attention/],
    [{ status: 'confirmed', paid_at: '2026-11-27' }, /Your stay is booked/],
  ]) {
    const html = await renderQuote(overrides, 'return');
    assert.match(html, message);
    assert.doesNotMatch(html, /<form|Change dates|has expired/);
  }
});

for (const minutes of [60, 480, 10080, 59, 10081, 60.5]) {
  test(`owner save and automatic quote agree on the ${minutes}-minute policy`, async () => {
    const writes = [];
    const imports = {
      'next/headers': { cookies: async () => ({ get: () => ({ value: 'fixture-only' }) }) },
      'next/navigation': { redirect: path => { throw new Error(path); } },
      '@/lib/booking-db': { bookingClient: () => ({ updateInstantSettings: async policy => { writes.push(policy); } }) },
      '@/lib/owner-auth.mjs': { OWNER_COOKIE_NAME: 'fixture', verifyOwnerSessionToken: () => true },
    };
    const action = loadPolicy({}, name => Object.hasOwn(imports, name) ? imports[name]
      : require(name.startsWith('@/lib/') ? '../' + name.slice(2) : name)).saveInstantBookingPolicy;
    const form = new FormData();
    for (const [name, value] of Object.entries({
      base_nightly: '125.10', weekend_nightly: '205.19', cleaning: '0', pet_fee: '50',
      pet_fee_mode: 'per_stay', tax_percent: '11.7', taxable_fees: 'yes', deposit_percent: '25',
      min_nights: '2', booking_window_days: '60', hold_minutes: String(minutes),
      cancellation_terms: quote.cancellation_terms, balance_terms: quote.balance_terms,
    })) form.set(name, value);
    const valid = [60, 480, 10080].includes(minutes);
    await assert.rejects(action(form), { message: `/owner/settings?instant=${valid ? 'saved' : 'error'}` });
    assert.equal(writes.length, valid ? 1 : 0);
    if (valid) {
      assert.equal(writes[0].hold_minutes, minutes);
      const now = new Date('2026-11-27T12:00:00Z');
      const result = directQuote({ ...quote, status: 'requested' }, {
        ...writes[0], configured: true, enabled: true, airbnb_channel_guarded: true,
      }, now);
      assert.equal(result.quote_expires, new Date(now.getTime() + minutes * 60000).toISOString());
      assert.equal(writes[0].enabled, false);
    }
  });
}
