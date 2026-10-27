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
test('the header follows the approved split rural-pond composition', () => {
  const hero = read('app/_components/RetreatHero.tsx');
  const css = read('app/_components/RetreatHero.module.css');
  assert.match(hero, /Down by/);
  assert.match(hero, /the pond/);
  assert.match(hero, /data-pond-copy/);
  assert.match(hero, /data-pond-photos/);
  assert.match(css, /grid-template-columns:/);
  assert.doesNotMatch(hero, /Make time|for each other|adults.only|spa credit|concierge|award.winning|setInterval|autoPlay/i);
});
test('the static collage uses existing property photos and keeps both booking paths', () => {
  const hero = read('app/_components/RetreatHero.tsx');
  const home = read('app/page.tsx');
  for (const n of [46, 4, 3]) assert.ok(home.includes('photo: ' + n));
  for (const n of [0, 1, 2]) assert.ok(hero.includes('scenes[' + n + ']'));
  assert.match(hero, /priority=\{index === 0\}/);
  assert.match(hero, /alt=\{scene.alt\}/);
  assert.match(hero, /href="\/book"/);
  assert.match(hero, /href=\{airbnbHref\}/);
  assert.doesNotMatch(hero, /useState|useEffect|"use client"/);
});
