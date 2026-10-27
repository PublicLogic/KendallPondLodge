import test from 'node:test';
import assert from 'node:assert/strict';
import { clearGuestRequestKey, createGuestRequestKeyManager } from '../lib/guest-request-key.mjs';
import { validateGuestRequest } from '../lib/kpl-booking-core.mjs';

const raw = {
  check_in: '2027-01-12', check_out: '2027-01-14',
  guest_name: 'Example Guest', guest_email: 'guest@example.test',
  guests: '2', pets: '0', note: 'A quiet midweek stay.', consent: 'yes',
};
const form = (changes = {}) => {
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...raw, ...changes })) data.set(key, value);
  return data;
};
function tabStorage() {
  const entries = new Map();
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: key => entries.delete(key),
    values: () => [...entries.values()],
  };
}

test('an ambiguous retry and a page reload reuse the original request key without storing guest details', async () => {
  const storage = tabStorage();
  const requestKey = createGuestRequestKeyManager(storage);
  const original = await requestKey(form());
  assert.match(original, /^[0-9a-f-]{36}$/);
  assert.equal(await requestKey(form()), original);
  const afterReload = createGuestRequestKeyManager(storage);
  assert.equal(await afterReload(form({ guest_email: ' GUEST@EXAMPLE.TEST ', guest_name: ' Example Guest ', guests: '02' })), original);
  const persisted = storage.values().join('');
  for (const privateValue of [raw.guest_name, raw.guest_email, raw.note, raw.check_in]) {
    assert.equal(persisted.includes(privateValue), false);
  }
});

test('changing any booking detail starts a different request while concurrent unchanged attempts share a key', async () => {
  for (const change of [
    { check_in: '2027-01-13' }, { check_out: '2027-01-15' },
    { guest_name: 'Another Guest' }, { guest_email: 'another@example.test' },
    { guests: '3' }, { pets: '1' }, { note: 'Different plans.' },
  ]) {
    const requestKey = createGuestRequestKeyManager(tabStorage());
    assert.notEqual(await requestKey(form()), await requestKey(form(change)));
  }
  const requestKey = createGuestRequestKeyManager(tabStorage());
  const keys = await Promise.all([requestKey(form()), requestKey(form()), requestKey(form())]);
  assert.equal(new Set(keys).size, 1);
});

test('blocked browser storage still protects retries within the open form', async () => {
  const unavailable = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  const requestKey = createGuestRequestKeyManager(unavailable);
  assert.equal(await requestKey(form()), await requestKey(form()));
});

test('an acknowledged request can be followed by a deliberately new request with identical details', async () => {
  const storage = tabStorage();
  const original = await createGuestRequestKeyManager(storage)(form());
  clearGuestRequestKey(storage, original);
  assert.equal(storage.values().length, 0);
  assert.notEqual(await createGuestRequestKeyManager(storage)(form()), original);
});

test('an older acknowledgement cannot clear the retained key for a newer ambiguous request', async () => {
  const storage = tabStorage();
  const requestKey = createGuestRequestKeyManager(storage);
  const earlier = await requestKey(form());
  const latest = await requestKey(form({ note: 'A later request.' }));
  clearGuestRequestKey(storage, earlier);
  assert.equal(await createGuestRequestKeyManager(storage)(form({ note: 'A later request.' })), latest);
  clearGuestRequestKey(storage, latest);
  assert.equal(storage.values().length, 0);
});

test('guest validation preserves a valid request key and rejects malformed supplied keys', () => {
  const request_key = 'A0000000-0000-4000-8000-000000000001';
  const now = new Date('2026-10-27T12:00:00Z');
  assert.equal(validateGuestRequest({ ...raw, request_key }, now).request_key, request_key.toLowerCase());
  assert.equal(Object.hasOwn(validateGuestRequest(raw, now), 'request_key'), false);
  for (const bad of ['', 'not-a-uuid', `${request_key} extra`]) {
    assert.throws(() => validateGuestRequest({ ...raw, request_key: bad }, now), error => error.code === 'invalid_request');
  }
});
