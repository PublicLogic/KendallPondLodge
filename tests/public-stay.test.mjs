import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
const target = new URL('../app/_data/public-stay.json', import.meta.url);
const load = () => JSON.parse(readFileSync(target, 'utf8'));
test('public stay information has one verified source of truth', () => {
  assert.ok(existsSync(target), 'public stay facts module is missing');
  const d = load();
  assert.equal(d.maxGuests, 8);
  assert.equal(d.maxPets, 2);
  assert.equal(d.bedrooms, 3);
  assert.equal(d.bathrooms, 2);
});
test('sleeping plan identifies the shared sofa without creating a fourth bedroom', () => {
  assert.ok(existsSync(target), 'public stay facts module is missing');
  const d = load();
  assert.equal(d.sleeping.length, 4);
  assert.equal(d.sleeping.filter(x => x.privateBedroom).length, 3);
  assert.match(d.sleeping.find(x => !x.privateBedroom).bed, /queen sleeper sofa/i);
  assert.match(d.sleepingNote, /eight|8/);
  assert.match(d.sleepingNote, /not a fourth bedroom/);
});
test('booking explains terms and payment without invented rates or confirmation', () => {
  assert.ok(existsSync(target), 'public stay facts module is missing');
  const d = load();
  assert.equal(d.bookingSteps.length, 3);
  assert.match(d.bookingSteps[0].body, /not a reservation/);
  assert.match(d.bookingSteps[1].body, /fees|tax/);
  assert.match(d.bookingSteps[2].body, /confirmed/);
  assert.doesNotMatch(JSON.stringify(d), /\$\d|guaranteed|instant booking/i);
});
test('guest evidence is attributed and dated, with no fabricated individual quotes', () => {
  assert.ok(existsSync(target), 'public stay facts module is missing');
  const d = load();
  assert.equal(d.reviewSnapshot.rating, '4.83');
  assert.equal(d.reviewSnapshot.count, 30);
  assert.equal(d.reviewSnapshot.checkedOn, '2026-10-27');
  assert.match(d.reviewSnapshot.url, /^https:\/\/www\.airbnb\.com\/rooms\/1667597913565948713/);
  assert.equal(d.testimonials, undefined);
  assert.equal(new Set(d.faq.map(x=>x.id)).size, d.faq.length);
});
