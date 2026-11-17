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


test('Preview is an actual interactive machine, not a fake live checkout',()=>{
 const page=source('app/store/page.tsx');
 const machine=source('app/store/VendingMachine.tsx');
 const art=source('app/store/ProductArt.tsx');
 assert.match(page,/const checkoutEnabled = !commerce && process\.env\.VERCEL_ENV === "production"/);
 assert.match(page,/const commerce=liveStoreCheckoutEnabled\(\)/);
 assert.match(page,/<VendingMachine checkoutEnabled=\{checkoutEnabled\}\/>/);
 assert.match(page,/form action=\{startStoreCheckout\}/); // Existing PJ checkout is preserved.
 assert.match(page,/data-mercantile-editorial data-vending-experience/);
 assert.match(machine,/if\(!checkoutEnabled\)/); // No live Stripe anchor when Preview.
 assert.match(machine,/href=\{item\.stripeUrl\}/); // Same verified payment links when live.
 assert.match(machine,/aria-pressed=\{selectedSku===item\.sku\}/);
 assert.match(machine,/aria-live="polite"/);
 assert.match(machine,/onClick=\{luckyPick\}/);
 assert.match(machine,/ProductArt sku=\{item\.sku\}/);
 assert.match(art,/Decorative category illustrations/);
 assert.doesNotMatch(machine,/Add to cart|Checkout basket|in stock now/i);
});

test('Machine checkout respects touch sizing, visible categories and reduced motion',()=>{
 const machine=source('app/store/VendingMachine.tsx');
 const css=source('app/store/mercantile.module.css');
 assert.match(machine,/aria-label="Choose a shelf category"/);
 assert.match(machine,/aria-pressed=\{group===choice\.key\}/);
 assert.match(machine,/aria-label="Selected item and checkout"/);
 assert.match(machine,/Quantity can be changed|Choose the quantity/);
 assert.match(css,/min-height:48px/);
 assert.match(css,/min-height:49px/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/\.mobileCheckout/);
 assert.match(css,/\.slotSelected/);
});

test('Stripe Payment Links do not invent PJ inventory or fulfillment',()=>{
 const machine=source('app/store/VendingMachine.tsx');
 const page=source('app/store/page.tsx');
 const owner=source('app/owner/store/page.tsx');
 assert.match(machine,/There is no automatic dispenser or live stock count yet/);
 assert.match(machine,/Each checkout is for one product type/);
 assert.match(page,/only feature gated|separately feature gated/);
 assert.match(owner,/does not automatically decrement PuddleJumper stock/);
 assert.match(owner,/requireKplOwner\('\/owner\/store'\)/);
});
