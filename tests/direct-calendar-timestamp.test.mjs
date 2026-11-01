import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDirectBookingCalendar } from '../lib/direct-calendar.mjs';
test('checkout and confirmed events use valid whole-second UTC iCalendar timestamps', () => {
  for (const status of ['checkout', 'confirmed']) {
    const text = buildDirectBookingCalendar([{id:'test', status, check_in:'2026-12-15', check_out:'2026-12-17', created_at:'2026-11-01T19:55:59.247Z'}],new Date('2026-11-01T20:00:00Z'));
    assert.match(text, /DTSTAMP:20261101T195559Z\r\n/);
    assert.match(text, /DTSTART;VALUE=DATE:20261215\r\nDTEND;VALUE=DATE:20261217/);
  }
});
