import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mercantilePaymentLinks,mercantileCategories} from '../lib/mercantile-payment-links.mjs';

const source=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Mercantile offers 11 verified Stripe Payment Links at the approved prices',()=>{
  assert.equal(mercantilePaymentLinks.length,11);
  assert.deepEqual(Object.fromEntries(mercantilePaymentLinks.map(p=>[p.sku,p.priceCents])),{
    'KPL-WOOD-001':1000,
    'KPL-CRAFT-001':2000,
    'KPL-HAT-001':1200,
    'KPL-MITT-001':1200,
    'KPL-SET-001':2000,
    'KPL-SLIP-001':800,
    'KPL-CANDY-001':100,
    'KPL-COOKIE-001':125,
    'KPL-CHIP-001':150,
    'KPL-CANDY-002':175,
    'KPL-SNACK-002':225,
  });
  assert.deepEqual(mercantileCategories.map(g=>g.key),['Firewood','Handmade','Snacks']);
  assert.equal(new Set(mercantilePaymentLinks.map(p=>p.sku)).size,11);
  assert.equal(new Set(mercantilePaymentLinks.map(p=>p.stripeUrl)).size,11);
});

test('Every public payment link is an approved Stripe Payment Link host and a valid item',()=>{
  for(const product of mercantilePaymentLinks){
    const url=new URL(product.stripeUrl);
    assert.equal(url.origin,'https://pay.publiclogic.org');
    assert.match(url.pathname,/^\/b\/[a-zA-Z0-9]+$/);
    assert.equal(url.search,'');
    assert.equal(url.hash,'');
    assert.match(product.sku,/^KPL-[A-Z0-9]+-\d{3}$/);
    assert.ok(product.name.length>2&&product.description.length>10);
    assert.ok(Number.isSafeInteger(product.priceCents)&&product.priceCents>=100);
    assert.ok(mercantileCategories.some(category=>category.key===product.category));
  }
});

test('Guest and owner preview builds do not expose live purchase buttons',()=>{
  const guest=source('app/store/page.tsx');
  const owner=source('app/owner/store/page.tsx');
  assert.match(guest,/const allowLiveFallback=process\.env\.VERCEL_ENV==='production'/);
  assert.match(guest,/allowLiveFallback\?<a href=\{item\.stripeUrl\}/);
  assert.match(guest,/enabled&&connected\?items:\[\]/);
  assert.match(guest,/const fallback=!enabled/);
  assert.match(owner,/process\.env\.VERCEL_ENV==='production'/);
  assert.match(owner,/Live link disabled in Preview/);
});

test('Manual link payments do not claim PuddleJumper inventory reconciliation',()=>{
  const guest=source('app/store/page.tsx');
  const owner=source('app/owner/store/page.tsx');
  assert.match(guest,/mercantilePaymentLinks\.filter/);
  assert.match(owner,/mercantilePaymentLinks\.map/);
  assert.match(owner,/does not automatically decrement PuddleJumper stock/);
  assert.match(owner,/requireKplOwner\('\/owner\/store'\)/);
});
