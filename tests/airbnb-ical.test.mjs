import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseIcsEvents, blockedNightsFromIcs, reservedNightsFromIcs,
  fetchAirbnbIcs, airbnbBlockedNights, airbnbReservedNights, airbnbStayStatus, resetAirbnbIcsCacheForTests,
} from '../lib/airbnb-ical.mjs';
import { nightsBetween } from '../lib/booking.mjs';

const SAMPLE_ICS = [
  'BEGIN:VCALENDAR',
  'BEGIN:VEVENT',
  'DTSTART;VALUE=DATE:20261010',
  'DTEND;VALUE=DATE:20261013',
  'SUMMARY:Reserved',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'DTSTART:20261101T150000Z',
  'DTEND:20261103T110000Z',
  'SUMMARY:Airbnb (Not available)',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

test('parses both date-only and date-time DTSTART/DTEND forms', () => {
  const events = parseIcsEvents(SAMPLE_ICS);
  assert.deepEqual(events, [
    { start: '2026-10-10', end: '2026-10-13', summary: 'Reserved' },
    { start: '2026-11-01', end: '2026-11-03', summary: 'Airbnb (Not available)' },
  ]);
});

test('DTEND is exclusive: the checkout night is not blocked', () => {
  const nights = blockedNightsFromIcs(SAMPLE_ICS);
  assert.deepEqual([...nights].sort(), ['2026-10-10', '2026-10-11', '2026-10-12', '2026-11-01', '2026-11-02']);
});

test('reservedNightsFromIcs only includes SUMMARY:Reserved, not an owner-side manual block', () => {
  const nights = reservedNightsFromIcs(SAMPLE_ICS);
  assert.deepEqual([...nights].sort(), ['2026-10-10', '2026-10-11', '2026-10-12']);
});

test('an event with no explicit DTEND blocks exactly one night', () => {
  const ics = 'BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261225\r\nSUMMARY:Reserved\r\nEND:VEVENT';
  assert.deepEqual([...blockedNightsFromIcs(ics)], ['2026-12-25']);
});

test('fetchAirbnbIcs fails closed when KPL_AIRBNB_ICAL_URL is not configured', async () => {
  resetAirbnbIcsCacheForTests();
  const original = process.env.KPL_AIRBNB_ICAL_URL;
  delete process.env.KPL_AIRBNB_ICAL_URL;
  try {
    await assert.rejects(fetchAirbnbIcs({ now: Date.now() }), /not configured/);
  } finally {
    if (original !== undefined) process.env.KPL_AIRBNB_ICAL_URL = original;
  }
});

test('fetchAirbnbIcs fails closed on a network error and never leaks the URL in the thrown message', async () => {
  resetAirbnbIcsCacheForTests();
  process.env.KPL_AIRBNB_ICAL_URL = 'https://example.invalid/private-secret-token.ics';
  const failing = async () => { throw new Error('getaddrinfo ENOTFOUND https://example.invalid/private-secret-token.ics'); };
  await assert.rejects(
    fetchAirbnbIcs({ now: Date.now(), fetchImpl: failing }),
    (error) => error instanceof Error && !error.message.includes('example.invalid') && !error.message.includes('private-secret-token'),
  );
});

test('fetchAirbnbIcs fails closed on a non-2xx response', async () => {
  resetAirbnbIcsCacheForTests();
  process.env.KPL_AIRBNB_ICAL_URL = 'https://example.invalid/feed.ics';
  const notFound = async () => new Response('nope', { status: 404 });
  await assert.rejects(fetchAirbnbIcs({ now: Date.now(), fetchImpl: notFound }), /404/);
});

test('fetchAirbnbIcs rejects an HTTP 200 body that is not a calendar', async () => {
  resetAirbnbIcsCacheForTests();
  process.env.KPL_AIRBNB_ICAL_URL = 'https://example.invalid/feed.ics';
  const html = async () => new Response('<html>temporarily unavailable</html>', { status: 200 });
  await assert.rejects(fetchAirbnbIcs({ now: Date.now(), fetchImpl: html }), /calendar format/i);
});

test('fetchAirbnbIcs rejects a calendar with an invalid event date', async () => {
  resetAirbnbIcsCacheForTests();
  process.env.KPL_AIRBNB_ICAL_URL = 'https://example.invalid/feed.ics';
  const invalid = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261340\r\nDTEND;VALUE=DATE:20270102\r\nSUMMARY:Reserved\r\nEND:VEVENT\r\nEND:VCALENDAR';
  const serving = async () => new Response(invalid, { status: 200 });
  await assert.rejects(fetchAirbnbIcs({ now: Date.now(), fetchImpl: serving }), /calendar format/i);
});

test('fetchAirbnbIcs rejects an invalid checkout date instead of making a one-night event', async () => {
  resetAirbnbIcsCacheForTests();
  process.env.KPL_AIRBNB_ICAL_URL = 'https://example.invalid/feed.ics';
  const invalid = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261201\r\nDTEND;VALUE=DATE:20261340\r\nSUMMARY:Reserved\r\nEND:VEVENT\r\nEND:VCALENDAR';
  const serving = async () => new Response(invalid, { status: 200 });
  await assert.rejects(fetchAirbnbIcs({ now: Date.now(), fetchImpl: serving }), /calendar format/i);
});

test('fetchAirbnbIcs caches the feed for 5 minutes and refetches after', async () => {
  resetAirbnbIcsCacheForTests();
  process.env.KPL_AIRBNB_ICAL_URL = 'https://example.invalid/feed.ics';
  let calls = 0;
  const counting = async () => { calls += 1; return new Response(SAMPLE_ICS, { status: 200 }); };
  const t0 = 1_000_000;
  await fetchAirbnbIcs({ now: t0, fetchImpl: counting });
  await fetchAirbnbIcs({ now: t0 + 60_000, fetchImpl: counting });
  assert.equal(calls, 1, 'a call within the 5-minute TTL must not refetch');
  await fetchAirbnbIcs({ now: t0 + 301_000, fetchImpl: counting });
  assert.equal(calls, 2, 'a call past the 5-minute TTL must refetch');
});

test('a fresh availability check bypasses an earlier cached free feed', async () => {
  resetAirbnbIcsCacheForTests();
  process.env.KPL_AIRBNB_ICAL_URL = 'https://example.invalid/feed.ics';
  let body = 'BEGIN:VCALENDAR\r\nEND:VCALENDAR';
  let calls = 0;
  const serving = async () => { calls += 1; return new Response(body, { status: 200 }); };
  const initial = await fetchAirbnbIcs({ now: 1_000_000, fetchImpl: serving });
  assert.equal(airbnbStayStatus(initial, ['2026-10-10']), 'free');
  body = SAMPLE_ICS;
  const fresh = await fetchAirbnbIcs({ now: 1_000_001, fetchImpl: serving, fresh: true });
  assert.equal(calls, 2);
  assert.equal(airbnbStayStatus(fresh, ['2026-10-10']), 'conflict');
});

test('quote needs free nights and payment needs every night owner-blocked', () => {
  assert.equal(airbnbStayStatus(SAMPLE_ICS, ['2026-12-01', '2026-12-02']), 'free');
  assert.equal(airbnbStayStatus(SAMPLE_ICS, ['2026-11-01', '2026-11-02']), 'owner-blocked');
  assert.equal(airbnbStayStatus(SAMPLE_ICS, ['2026-11-02', '2026-11-03']), 'partial');
  assert.equal(airbnbStayStatus(SAMPLE_ICS, ['2026-10-10', '2026-10-11']), 'conflict');
});

test('an unknown Airbnb event summary blocks payment instead of looking free', () => {
  const unknown = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261201\r\nDTEND;VALUE=DATE:20261203\r\nSUMMARY:Guest reservation\r\nEND:VEVENT\r\nEND:VCALENDAR';
  assert.equal(airbnbStayStatus(unknown, ['2026-12-01', '2026-12-02']), 'conflict');
});

test('generic Unavailable is not accepted as proof of this owner block', () => {
  const unknown = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261201\r\nDTEND;VALUE=DATE:20261203\r\nSUMMARY:Unavailable\r\nEND:VEVENT\r\nEND:VCALENDAR';
  assert.equal(airbnbStayStatus(unknown, ['2026-12-01', '2026-12-02']), 'conflict');
});

test('airbnbBlockedNights and airbnbReservedNights compose fetch + parse correctly', async () => {
  resetAirbnbIcsCacheForTests();
  process.env.KPL_AIRBNB_ICAL_URL = 'https://example.invalid/feed.ics';
  const serving = async () => new Response(SAMPLE_ICS, { status: 200 });
  const blocked = await airbnbBlockedNights({ now: Date.now(), fetchImpl: serving });
  assert.ok(blocked.has('2026-11-01'));
  resetAirbnbIcsCacheForTests();
  const reserved = await airbnbReservedNights({ now: Date.now(), fetchImpl: serving });
  assert.ok(!reserved.has('2026-11-01'));
  assert.ok(reserved.has('2026-10-10'));
});

test('nightsBetween lists each stayed night, checkout day excluded', () => {
  assert.deepEqual(nightsBetween('2026-10-10', '2026-10-13'), ['2026-10-10', '2026-10-11', '2026-10-12']);
  assert.throws(() => nightsBetween('2026-10-13', '2026-10-10'));
});
