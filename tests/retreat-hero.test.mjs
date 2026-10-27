import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
test('hero revision preserves the approved content below it', () => {
  const home = read('app/page.tsx');
  const marker = '      <GuestReviewEvidence />';
  assert.ok(home.includes(marker));
  assert.equal(createHash('sha256').update(home.slice(home.indexOf(marker))).digest('hex'), '9bfa182fc30e1d4c9807fac5ebd42e31904be6c92b2fd7b1060b774f1539aee2');
});
test('the hero is experiential without inventing a couples-only resort', () => {
  assert.ok(existsSync(new URL('../app/_components/RetreatHero.tsx', import.meta.url)), 'RetreatHero is missing');
  const hero = read('app/_components/RetreatHero.tsx');
  assert.match(hero, /Make time/);
  assert.match(hero, /for each other/);
  assert.doesNotMatch(hero, /Bring the crew|adults.only|spa credit|concierge|award.winning|setInterval|autoPlay/i);
  assert.match(hero, /aria-pressed/);
  assert.match(hero, /directEnabled/);
});
test('scenes use existing property photographs with a still first frame', () => {
  assert.ok(existsSync(new URL('../app/_components/RetreatHero.tsx', import.meta.url)), 'RetreatHero is missing');
  const hero = read('app/_components/RetreatHero.tsx');
  const home = read('app/page.tsx');
  for (const n of [46, 4, 3]) assert.ok(home.includes('photo: ' + n));
  assert.match(hero, /useState\(0\)/);
  assert.match(hero, /priority/);
});
