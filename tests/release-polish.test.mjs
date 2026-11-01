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
test('gallery has balanced real photos, rather than the narrow hot-tub strip', () => {
  const page = read('app/photos/page.tsx');
  const css = read('app/photos/photos.module.css');
  assert.match(page, /data-gallery-cover/);
  assert.match(page, /lodgePhoto\(7\)/);
  assert.match(page, /lodgePhoto\(25\)/);
  assert.match(css, /\.coverImage/);
});
test('active calendar weekday and legend text retain readable contrast', () => {
  const css = read('app/guest-ready.css');
  assert.match(css, /\.booking-panel-direct \.stay-calendar-weekdays span,\s*\.booking-panel-direct \.stay-calendar-key\s*\{\s*color: #405b4e;/);
});
