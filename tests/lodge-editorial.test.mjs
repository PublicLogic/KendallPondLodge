import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page = read('app/lodge/page.tsx');
const manifest = JSON.parse(read('public/images/kpl/website-top-50/manifest.json'));

test('Lodge page uses the curated exterior, rooms and waterfront without repeating frames',()=>{
  assert.match(page,/data-lodge-editorial/);
  const orders=[...page.matchAll(/lodgePhoto\((\d+)\)/g)].map(m=>Number(m[1]));
  assert.equal(orders.length,new Set(orders).size);
  for(const order of [5,11,17,13,25,23,27,6,2]) assert.ok(orders.includes(order),'Missing photo '+order);
  for(const order of orders){const p=manifest.photos.find(x=>x.order===order);assert.ok(p);assert.ok(existsSync(new URL('../public'+p.src,import.meta.url)));}
  for(const order of [7,25,23,27]) assert.match(manifest.photos.find(p=>p.order===order).src, /premium\.webp$/);
});

test('Lodge refresh retains sleeping facts, guest guide and safe date request',()=>{
  assert.match(page,/id="sleeping"/);
  assert.match(page,/<SleepPlan\s*\/>/);
  assert.match(page,/href="\/book"/);
  assert.match(page,/href="\/guidebook"/);
  assert.match(page,/hostContactHref\(\)/);
  assert.match(page,/stairs/i);
  assert.doesNotMatch(page,/<video|<iframe|autoPlay|setInterval|\.mp4|unoptimized/);
  assert.doesNotMatch(page, /<PageHero|<PhotoCard|<InfoCard/);
});

test('Lodge photography has one priority image and responsive intrinsic sizing',()=>{
  assert.equal((page.match(/priority=\{/g)||[]).length,1);
  assert.match(page,/width=\{photo.width\}/);
  assert.match(page,/height=\{photo.height\}/);
  assert.match(page,/sizes=\{sizes\}/);
  assert.match(page,/loading=\{priority \? "eager" : "lazy"\}/);
  assert.match(page,/lodge\.module\.css/);
});


test("The Lodge opens on its own property photo, beneath the same smooth site header", () => {
  const css = read("app/lodge/lodge.module.css");
  const shell = read("app/_components/ExperienceShell.tsx");
  assert.match(page, /data-lodge-cover/);
  assert.match(page, /data-retreat-hero/);
  assert.match(page, /photo=\{photos\.arrival\}/);
  assert.match(page, /sizes="100vw"/);
  assert.match(css, /\.coverPhotograph img/);
  assert.match(css, /\.coverShade/);
  assert.match(css, /#213f32/);
  assert.match(shell, /const onLodge = pathname === "\/lodge"/);
  assert.match(shell, /const hasPhotoOpening = onHome \|\| onLodge/);
  assert.match(shell, /hasPhotoOpening \? "hospitality-header-immersive"/);
  assert.match(shell, /data-retreat-hero/);
});

test("The Lodge tour includes dining, deck, and covered hot tub without borrowed aerials", () => {
  for (const order of [19,31,37]) assert.match(page, new RegExp("lodgePhoto\\(" + order + "\\)"));
  for (const label of ["The kitchen", "The dining room", "The upper deck", "The covered hot tub"]) {
    assert.ok(page.includes(label), "Missing Lodge tour image: " + label);
  }
  assert.doesNotMatch(page, /KP3|KP2|KENDALL-POND|pond-aerials|unsplash|pexels/i);
});

test("The Lodge booking copy does not promise a manual quote", () => {
  assert.match(page, /review the full price and terms/i);
  assert.doesNotMatch(page, /send the full quote|send your dates|we.ll check availability/i);
  assert.match(page, /href="\/book"/);
  assert.match(page, /href="\/grounds"/);
  assert.match(page, /href="\/photos"/);
  assert.match(page, /href="\/guidebook"/);
});
