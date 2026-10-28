import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
test('homepage refresh preserves booking and review content below the hero', () => {
  const home = read('app/page.tsx');
  assert.match(home, /<GuestReviewEvidence \/>/);
  assert.match(home, /\{enabled && <BookingSteps \/>\}/);
  assert.match(home, /<StayFAQ contactHref=\{hostContactHref\(\)\} \/>/);
  assert.match(home, /showcase-close/);
});
test('the header follows the approved split rural-pond composition', () => {
  const hero = read('app/_components/RetreatHero.tsx');
  const css = read('app/_components/RetreatHero.module.css');
  assert.match(hero, /Down by/);
  assert.match(hero, /the pond/);
  assert.match(hero, /data-pond-copy/);
  assert.match(hero, /data-pond-photos/);
  assert.match(css, /grid-template-columns:/);
  assert.doesNotMatch(hero, /Make time|for each other|adults.only|spa credit|concierge|award.winning|setInterval/i);
});
test('the static collage uses existing property photos and keeps both booking paths', () => {
  const hero = read('app/_components/RetreatHero.tsx');
  const home = read('app/page.tsx');
  for (const name of ['deck-lounge-autumn']) {
    const src = '/images/kpl/2026-10-28/kendall-pond-lodge-' + name + '.webp';
    assert.ok(home.includes(src));
    assert.ok(existsSync(new URL('../public' + src, import.meta.url)));
  }
  assert.match(home, /lodgePhoto\\(46\\)/);
  assert.match(home, /lodgePhoto\(4\)/);
  assert.match(home, /const house = lodgePhoto\(7\)/);
  assert.doesNotMatch(home + hero, /<iframe/);
  for (const n of [0, 1, 2]) assert.ok(hero.includes('scenes[' + n + ']'));
  assert.match(hero, /priority=\{index === 0\}/);
  assert.match(hero, /alt=\{scene.alt\}/);
  assert.match(hero, /href="\/book"/);
  assert.match(hero, /href=\{airbnbHref\}/);
  assert.doesNotMatch(hero, /useState|useEffect|"use client"/);
});
