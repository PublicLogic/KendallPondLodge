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
  for(const order of [7,5,17,13,25,23,27,6,2]) assert.ok(orders.includes(order),'Missing photo '+order);
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
