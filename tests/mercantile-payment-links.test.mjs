import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {mercantilePaymentLinks,mercantileCategories} from '../lib/mercantile-payment-links.mjs';

const read = (path) => readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('verified Mercantile catalog has thirteen unique SKUs, prices, and links',()=>{
  assert.equal(mercantilePaymentLinks.length,13);
  assert.deepEqual(Object.fromEntries(mercantilePaymentLinks.map(p=>[p.sku,p.priceCents])),{
    'KPL-WOOD-001':1000,
    'KPL-PUDDLES-SET-001':2500,
    'KPL-PUDDLES-001':1000,
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
  assert.deepEqual(mercantileCategories.map(g=>g.key),['Firewood','Keepsakes','Handmade','Snacks']);
  assert.equal(new Set(mercantilePaymentLinks.map(p=>p.sku)).size,13);
  assert.equal(new Set(mercantilePaymentLinks.map(p=>p.stripeUrl)).size,13);
});

test('Every item has a real Stripe Payment Link and a stable product identity',()=>{
  for(const item of mercantilePaymentLinks){
    const url=new URL(item.stripeUrl);
    assert.equal(url.origin,'https://pay.publiclogic.org');
    assert.match(url.pathname,/^\/b\/[A-Za-z0-9]+$/);
    assert.equal(url.search,'');
    assert.equal(url.hash,'');
    assert.match(item.sku,/^KPL-(?:[A-Z0-9]+-)+\d{3}$/);
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
  assert.match(shop,/check the baskets before purchasing/i);
  assert.match(shop,/Each checkout covers one product type/);
  assert.match(shop,/Bottled water is complimentary/);
  assert.match(css,/min-height:45px/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(shop,/in stock right now|only two left|free shipping/i);
});


test('Shop opens directly to a compact heading and products without a cinematic entrance',()=>{
  const page=read('app/store/page.tsx');
  const css=read('app/store/mercantile.module.css');
  assert.match(page,/className={styles.shopIntro}/);
  assert.match(page,/<h1>The Lodge Shop<\/h1>/);
  assert.match(page,/<Shopfront checkoutEnabled={checkoutEnabled}\/>/);
  assert.doesNotMatch(page,/styles.shopHero|styles.heroImage|welcomePhoto|<figure/);
  assert.match(css,/\.shopIntro\{[^}]*padding:35px 0 28px/);
  assert.match(css,/\.featured\{[^}]*min-height:158px/);
  assert.doesNotMatch(css,/min-height:clamp\(450px,58svh,640px\)/);
});

test('Puddles book and Kendall Pond stuffie bundle stay at approved prices',()=>{
  const bySku=Object.fromEntries(mercantilePaymentLinks.map(p=>[p.sku,p]));
  assert.equal(bySku['KPL-PUDDLES-001'].priceCents,1000);
  assert.equal(bySku['KPL-CRAFT-001'].priceCents,2000);
  assert.equal(bySku['KPL-PUDDLES-SET-001'].priceCents,2500);
  assert.equal(bySku['KPL-CRAFT-001'].name,'Kendall Pond Stuffie');
  assert.equal(bySku['KPL-PUDDLES-SET-001'].category,'Keepsakes');
  assert.equal(bySku['KPL-CRAFT-001'].priceCents+
    bySku['KPL-PUDDLES-001'].priceCents-
    bySku['KPL-PUDDLES-SET-001'].priceCents,500);
});

test('Shop uses exact real Lodge packshots on clean backgrounds, with only three stock fallbacks', async()=>{
 const {mercantileStudioPhotos:studio}=await import('../lib/mercantile-studio-photos.mjs');
 const {mercantileRepresentativePhotos:examples}=await import('../lib/mercantile-representative-photos.mjs');
 assert.equal(Object.keys(studio).length,10);
 const rest=mercantilePaymentLinks.filter(p=>!studio[p.sku]).map(p=>p.sku).sort();
 assert.deepEqual(rest,['KPL-CANDY-001','KPL-CANDY-002','KPL-COOKIE-001']);
 for (const [sku,photo] of Object.entries(studio)){
   assert.match(sku,/^KPL-/);
   assert.match(photo.src,/^\/images\/kpl\/mercantile\/studio\/[a-z-]+\.jpg$/);
   assert.ok(existsSync(new URL('../public'+photo.src,import.meta.url)),'Missing photo asset: '+photo.src);
   assert.ok(photo.alt.length>20);
 }
 for(const sku of rest) assert.ok(examples[sku]?.src.startsWith('https://images.pexels.com/'));
 const shop=read('app/store/Shopfront.tsx');
 const css=read('app/store/mercantile.module.css');
 assert.match(shop,/mercantileStudioPhotos/);
 assert.match(shop,/\/images\/kpl\/mercantile\/studio\/firewood\.jpg/);
 assert.match(shop,/Most photos show real Lodge items/);
 assert.match(shop,/studioImage/);
 assert.match(css,/\.studioImage\{object-fit:contain/);
 assert.doesNotMatch(shop,/shelf-overview\.avif|handlePhotoError|lodgePhoto\(/);
 assert.doesNotMatch(css,/shelfPreview|bundleStuffies|photoCandy/);
});
