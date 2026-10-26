import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();

const read = (file) =>
  fs.readFileSync(path.join(root, file), 'utf8');

test('booking calendar uses continuous range band with circular endpoints', () => {
  const picker = read('app/book/StayRequestForm.tsx');
  const css = read('app/booking.css');

  assert.match(picker, /stay-calendar-day-number/);
  assert.match(picker, /is-range-start/);
  assert.match(picker, /is-range-end/);
  assert.match(picker, /is-preview-end/);
  assert.match(picker, /aria-live="polite"/);

  assert.match(css, /\.stay-calendar-day\.is-range::before/);
  assert.match(css, /\.stay-calendar-day\.is-range-start::before/);
  assert.match(css, /\.stay-calendar-day\.is-range-end::before/);
  assert.match(css, /\.stay-calendar-day-number/);

  assert.equal(
    (css.match(/AIRBNB-STYLE PUBLIC DATE PICKER/g) ?? []).length,
    1,
  );
});
