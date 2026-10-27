import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
test('homepage contains one page, not the duplicated merge of two designs', () => {
  const home = read('app/page.tsx');
  assert.equal((home.match(/<main\b/g) || []).length, 1);
  assert.equal((home.match(/<RetreatHero\b/g) || []).length, 1);
  assert.doesNotMatch(home, /const directEnabled = directBookingEnabled/);
});
test('STAY sits after the calendar legend and before guest details', () => {
  const form = read('app/book/StayRequestForm.tsx');
  const page = read('app/book/page.tsx');
  const credit = form.indexOf('data-calendar-credit');
  assert.ok(credit > form.indexOf('className="stay-calendar-key"'));
  assert.ok(credit < form.indexOf('className="booking-fields booking-guest-fields"'));
  assert.match(form, /<BookingBrand\s*\/>/);
  assert.doesNotMatch(page, /<BookingBrand\s*\/>/);
});
test('gallery has balanced real photos, rather than the narrow hot-tub strip', () => {
  const page = read('app/photos/page.tsx');
  const css = read('app/guest-ready.css');
  assert.match(page, /gallery-retreat/);
  assert.match(page, /lodgePhoto\(3\)/);
  assert.match(page, /lodgePhoto\(4\)/);
  assert.match(css, /\.gallery-retreat \.gallery-intro-visual/);
});
