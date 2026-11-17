import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mercantilePaymentLinks,mercantileCategories} from '../lib/mercantile-payment-links.mjs';

const read = (path) => readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('verified Mercantile catalog has eleven unique SKUs, prices, and links',()=>{
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

test('Every item has a real Stripe Payment Link and a stable product identity',()=>{
  for(const item of mercantilePaymentLinks){
    const url=new URL(item.stripeUrl);
    assert.equal(url.origin,'https://pay.publiclogic.org');
    assert.match(url.pathname,/^\/b\/[A-Za-z0-9]+$/);
    assert.equal(url.search,'');
    assert.equal(url.hash,'');
    assert.match(item.sku,/^KPL-[A-Z0-9]+-\d{3}$/);
    assert.ok(item.name.length>2 && item.description.length>10);
    assert.ok(Number.isSafeInteger(item.priceCents) && item.priceCents>=100);
    assert.ok(mercantileCategories.some(group=>group.key===item.category));
  }
});

test('The shop shows product-first buying information, not decorative vending controls',()=>{
  const page=read('app/store/page.tsx');
  const shop=read('app/store/Shopfront.tsx');
  assert.match(page,/data-mercantile-editorial data-guest-shop/);
  assert.match(page,/Shopfront checkoutEnabled=\{checkoutEnabled\}/);
  assert.match(shop,/id="firewood"/);
  assert.match(shop,/id="shop"/);
  assert.match(shop,/aria-pressed=\{choice === category\}/);
  assert.match(shop,/item\.priceCents/);
  assert.match(shop,/href=\{item\.stripeUrl\}/);
  assert.match(shop,/target="_blank" rel="noopener noreferrer"/);
  assert.match(shop,/Preview only/);
  assert.doesNotMatch(shop,/slotCode|Surprise me|vending machine|dispense|fake cart/i);
});

test('Manual Stripe links are restricted to production, not shown with PJ checkout',()=>{
  const page=read('app/store/page.tsx');
  const shop=read('app/store/Shopfront.tsx');
  const owner=read('app/owner/store/page.tsx');
  assert.match(page,/const checkoutEnabled = !commerce && process\.env\.VERCEL_ENV === "production"/);
  assert.match(page,/const commerce=liveStoreCheckoutEnabled\(\)/);
  assert.match(page,/form action=\{startStoreCheckout\}/);
  assert.match(shop,/if \(!enabled\)/);
  assert.match(owner,/requireKplOwner\('\/owner\/store'\)/);
  assert.match(owner,/does not automatically decrement PuddleJumper stock/);
});

test('Product browsing and physical pickup stay honest and accessible',()=>{
  const shop=read('app/store/Shopfront.tsx');
  const css=read('app/store/mercantile.module.css');
  assert.match(shop,/role="group" aria-label="Filter products by category"/);
  assert.match(shop,/what’s on the shelves/);
  assert.match(shop,/Each checkout covers one product type/);
  assert.match(shop,/Bottled water is complimentary/);
  assert.match(css,/min-height:45px/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(shop,/in stock right now|only two left|free shipping/i);
});
