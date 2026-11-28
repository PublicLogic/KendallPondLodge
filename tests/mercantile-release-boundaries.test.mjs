import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { mercantilePaymentLinks } from '../lib/mercantile-payment-links.mjs';
import { mercantileStudioPhotos } from '../lib/mercantile-studio-photos.mjs';
import { mercantileOwnerPreviewEnabled } from '../lib/mercantile-owner-orders.mjs';

const require = createRequire(import.meta.url);
function load(path, imports, env = {}) {
  const compiled = ts.transpileModule(readFileSync(new URL('../' + path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  runInNewContext(compiled, {
    exports, process: { env }, require: name => Object.hasOwn(imports, name) ? imports[name] : require(name),
  });
  return exports.default;
}

test('the released thirteen prices and Payment Link destinations stay unchanged', () => {
  const expected = [
    ['KPL-WOOD-001', 1000, 'fZudRa4hU6Bv31f9SRgYU03'],
    ['KPL-PUDDLES-SET-001', 2500, '3cI3cw8ya6BveJX8ONgYU0f'],
    ['KPL-PUDDLES-001', 1000, '7sY00kaGi1hbbxLe97gYU0e'],
    ['KPL-CRAFT-001', 2000, '7sY14o7u6gc59pD3utgYU0d'],
    ['KPL-HAT-001', 1200, 'dRm8wQ29M3pj9pDaWVgYU04'],
    ['KPL-MITT-001', 1200, '8x2aEY5lY2lf7hvghfgYU05'],
    ['KPL-SET-001', 2000, 'aFafZiaGie3X0T7aWVgYU06'],
    ['KPL-SLIP-001', 800, 'bJe5kEeWy1hb6dr2qpgYU07'],
    ['KPL-CANDY-001', 100, 'dRmfZi9CebVP45jghfgYU08'],
    ['KPL-COOKIE-001', 125, '8x2bJ2g0Cf81dFT9SRgYU09'],
    ['KPL-CHIP-001', 150, 'aFa7sMbKm2lf1Xbd53gYU0a'],
    ['KPL-CANDY-002', 175, '5kQ28s7u67Fz9pD2qpgYU0b'],
    ['KPL-SNACK-002', 225, 'aFa7sM9Ce3pj9pD8ONgYU0c'],
  ].map(([sku, price, link]) => [sku, price, 'https://pay.publiclogic.org/b/' + link]);
  assert.deepEqual(mercantilePaymentLinks.map(item => [item.sku, item.priceCents, item.stripeUrl]), expected);
});
test('the released ten owner-photo mappings still reference real local studio assets', () => {
  assert.equal(Object.keys(mercantileStudioPhotos).length, 10);
  for (const photo of Object.values(mercantileStudioPhotos)) {
    assert.match(photo.src, /^\/images\/kpl\/mercantile\/studio\//);
    assert.ok(existsSync(new URL('../public' + photo.src, import.meta.url)));
  }
});
test('the public storefront keeps manual production checkout regardless of the dormant PJ flag', () => {
  for (const VERCEL_ENV of ['production', 'preview', undefined]) {
    for (const KPL_STAY_COMMERCE_ENABLED of ['true', 'false']) {
      let checkoutEnabled;
      const page = load('app/store/page.tsx', {
        './Shopfront': { default: props => { checkoutEnabled = props.checkoutEnabled; return null; } },
        './mercantile.module.css': { default: {} },
      }, { VERCEL_ENV, KPL_STAY_COMMERCE_ENABLED });
      const html = renderToStaticMarkup(page());
      assert.equal(checkoutEnabled, VERCEL_ENV === 'production');
      assert.match(html, /KPL Shelf Shop/);
      assert.doesNotMatch(html, /<form/);
    }
  }
});
test('the actual owner route authenticates before even attempting to read orders', async () => {
  const page = load('app/owner/store/page.tsx', {
    'next/link': { default: 'a' },
    '@/lib/require-kpl-owner': { requireKplOwner: async path => {
      assert.equal(path, '/owner/store');
      throw new Error('fixture-auth-required');
    } },
    '@/lib/booking-db': { bookingClient: () => assert.fail('no credentials before auth') },
    '@/lib/mercantile-owner-orders.mjs': {
      mercantileOwnerPreviewEnabled: () => true,
      readOwnerOrders: () => assert.fail('no orders before auth'),
    },
    './Orders': { Orders: () => null },
  });
  await assert.rejects(page({ searchParams: Promise.resolve({}) }), /fixture-auth-required/);
});
test('production owner review stays paused and never initializes a backend client', async () => {
  const env = { VERCEL_ENV: 'production', KPL_STAY_COMMERCE_ENABLED: 'true' };
  const page = load('app/owner/store/page.tsx', {
    'next/link': { default: 'a' },
    '@/lib/require-kpl-owner': { requireKplOwner: async () => {} },
    '@/lib/booking-db': { bookingClient: () => assert.fail('no production read') },
    '@/lib/mercantile-owner-orders.mjs': {
      mercantileOwnerPreviewEnabled: () => mercantileOwnerPreviewEnabled(env),
      readOwnerOrders: () => assert.fail('production preview is disabled'),
    },
    './Orders': { Orders: () => assert.fail('no substitute orders') },
  }, env);
  const html = renderToStaticMarkup(await page({ searchParams: Promise.resolve({}) }));
  assert.match(html, /paused or unavailable/);
  assert.doesNotMatch(html, /<form/);
});
