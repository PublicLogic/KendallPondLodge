import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import * as calendar from '../lib/airbnb-ical.mjs';
import { BookingServiceError, PjBookingClient, publicError } from '../lib/pj-booking-client.mjs';

const require = createRequire(import.meta.url);
const requestId = '10000000-0000-4000-8000-000000000001';
const quoteToken = '20000000-0000-4000-8000-000000000002';
const requestKey = '30000000-0000-4000-8000-000000000003';
const active = { configured: true, enabled: true, airbnb_channel_guarded: true };
const fallback = '/book?status=unavailable';

// Exercise the server action and the page it redirects to, with offline service boundaries.
function compile(file) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  return new Function('exports', 'require', outputText + '\nreturn exports;');
}

const loadAction = compile('../app/book/actions.ts');
const loadPage = compile('../app/book/page.tsx');

function fixture(t) {
  const pending = [];
  const after = t.mock.fn(callback => pending.push(callback));
  t.mock.method(console, 'error', () => {});
  const client = {
    instantSettings: t.mock.fn(async () => active),
    list: t.mock.fn(async () => []),
    createRequest: t.mock.fn(async () => ({ id: requestId })),
    autoPrice: t.mock.fn(async () => ({ quote_token: quoteToken })),
    sendQuote: t.mock.fn(async () => {}),
  };
  const airbnb = { ...calendar, fetchAirbnbIcs: t.mock.fn(async () => 'BEGIN:VCALENDAR\nEND:VCALENDAR') };
  const imports = {
    'next/navigation': { redirect(path) { throw new Error(path); } },
    'next/server': { after },
    '@/lib/booking-db': { bookingClient: () => client, directBookingEnabled: () => true, BookingServiceError, publicError },
    '@/lib/airbnb-ical.mjs': airbnb,
    '@/lib/booking-stripe': {},
    './book.module.css': { default: {} },
    './StayRequestForm': { StayRequestForm: () => 'Direct booking form' },
  };
  const resolve = name => Object.hasOwn(imports, name) ? imports[name]
    : require(name.startsWith('@/lib/') ? '../' + name.slice(2) : name);
  imports['./actions'] = loadAction({}, resolve);
  const page = loadPage({}, resolve).default;
  const form = new FormData();
  const futureDate = days => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  for (const [key, value] of Object.entries({
    check_in: futureDate(7), check_out: futureDate(9), guests: '2', pets: '0',
    guest_name: 'Test Guest', guest_email: 'guest@example.test', consent: 'yes', request_key: requestKey,
  })) form.set(key, value);
  return {
    client, airbnb, after, pending, form,
    submit: () => imports['./actions'].requestStay(form),
    render: async status => renderToStaticMarkup(await page({ searchParams: Promise.resolve({ status }) })),
  };
}

function assertAirbnb(html) {
  assert.match(html, /href="https:\/\/www\.airbnb\.com\/rooms\/1667597913565948713"/);
  assert.doesNotMatch(html, /Direct booking form|send the full quote/i);
}

for (const [name, settings] of [
  ['paused', { ...active, enabled: false }],
  ['unconfigured', { ...active, configured: false }],
  ['unguarded', { ...active, airbnb_channel_guarded: false }],
  ['missing settings endpoint', null],
]) {
  test(`${name} instant booking shows Airbnb and creates no request on submit`, async t => {
    const { client, pending, submit, render } = fixture(t);
    client.instantSettings.mock.mockImplementation(async () => {
      if (!settings) throw new BookingServiceError(404, 'not_found');
      return settings;
    });
    assertAirbnb(await render());
    await assert.rejects(submit, { message: fallback });
    assert.equal(client.createRequest.mock.callCount(), 0);
    assert.equal(client.autoPrice.mock.callCount(), 0);
    assert.equal(pending.length, 0);
  });
}

for (const [name, result] of [
  ['missing price response', null], ['empty quote token', { quote_token: '' }],
  ['malformed quote token', { quote_token: 'invalid-token' }],
  ['non-string quote token', { quote_token: [quoteToken] }],
]) {
  test(`${name} shows the Airbnb fallback even when settings are healthy again`, async t => {
    const { client, pending, submit, render } = fixture(t);
    client.autoPrice.mock.mockImplementation(async () => result);
    await assert.rejects(submit, { message: fallback });
    assert.equal(pending.length, 0);
    const html = await render('unavailable');
    assertAirbnb(html);
    assert.match(html, /couldn’t confirm a direct price/i);
  });
}

test('a pricing outage preserves the submitted key and defers recovery email until a priced retry', async t => {
  const { client, airbnb, pending, submit, render } = fixture(t);
  client.autoPrice.mock.mockImplementationOnce(async () => { throw new BookingServiceError(404, 'not_found'); });
  await assert.rejects(submit, { message: fallback });
  assert.equal(pending.length, 0);
  assert.match(await render(), /Direct booking form/);
  assert.deepEqual(await submit(), { received: true, instant_path: `/book/quote/${quoteToken}` });
  assert.deepEqual(client.createRequest.mock.calls.map(call => call.arguments[0].request_key), [requestKey, requestKey]);
  assert.ok(airbnb.fetchAirbnbIcs.mock.calls.every(call => call.arguments[0].fresh === true));
  assert.ok(client.list.mock.calls.every(call => call.arguments[0] === 100));
  assert.equal(pending.length, 1);
  assert.equal(client.sendQuote.mock.callCount(), 0);
  client.sendQuote.mock.mockImplementation(async () => { throw new BookingServiceError(503, 'message_unavailable'); });
  await pending[0]();
  assert.deepEqual(client.sendQuote.mock.calls[0].arguments, [requestId]);
});

test('a missing request ID is a service failure before pricing', async t => {
  const { client, pending, submit } = fixture(t);
  client.createRequest.mock.mockImplementation(async () => ({}));
  await assert.rejects(submit, { message: fallback });
  assert.equal(client.autoPrice.mock.callCount(), 0);
  assert.equal(pending.length, 0);
});

test('pausing instant booking during pricing keeps the new request and issues no quote', async t => {
  const { client, pending, submit } = fixture(t);
  client.instantSettings.mock.mockImplementationOnce(async () => ({ ...active, enabled: false }), 1);
  client.get = t.mock.fn(async () => ({ id: requestId, status: 'requested' }));
  client.issueQuote = t.mock.fn();
  client.autoPrice.mock.mockImplementation(PjBookingClient.prototype.autoPrice.bind(client));
  await assert.rejects(submit, { message: fallback });
  assert.equal(client.createRequest.mock.callCount(), 1);
  assert.equal(client.instantSettings.mock.callCount(), 2);
  assert.equal(client.issueQuote.mock.callCount(), 0);
  assert.equal(pending.length, 0);
});

test('an issued price is still returned when recovery email cannot be scheduled', async t => {
  const { after, client, submit } = fixture(t);
  after.mock.mockImplementation(() => { throw new Error('After-request work unavailable'); });
  assert.deepEqual(await submit(), { received: true, instant_path: `/book/quote/${quoteToken}` });
  assert.equal(client.sendQuote.mock.callCount(), 0);
});

test('overlapping confirmed stays keep their date-specific error and never create a request', async t => {
  const { form, client, pending, submit } = fixture(t);
  client.list.mock.mockImplementation(async () => [{
    check_in: form.get('check_in'), check_out: form.get('check_out'), status: 'confirmed',
  }]);
  await assert.rejects(submit, { message: '/book?status=overlapping_active_stay' });
  assert.equal(client.createRequest.mock.callCount(), 0);
  assert.equal(pending.length, 0);
});
