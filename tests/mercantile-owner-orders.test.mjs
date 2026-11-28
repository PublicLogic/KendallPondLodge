import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import * as navigation from '../lib/mercantile-owner-orders.mjs';

const require = createRequire(import.meta.url);
const compiled = ts.transpileModule(readFileSync(new URL('../app/owner/store/Orders.tsx', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const exports = {};
runInNewContext(compiled, { exports, require: id => id === 'next/link' ? { default: 'a' } :
  id === '@/lib/mercantile-owner-orders.mjs' ? navigation : require(id) });
const orders = Array.from({ length: 29 }, (_, i) => ({
  id: 'order-' + i, product_id: 'product-1', quantity: 1, total_cents: 1000,
  status: i === 24 ? 'paid' : 'expired', created_at: '2026-11-27T12:00:00Z'
}));
const render = props => renderToStaticMarkup(React.createElement(exports.Orders, { orders, ...props }));

test('owner follows rendered next-page navigation to a paid order beyond the first twelve', () => {
  let html = render({});
  assert.doesNotMatch(html, /<strong>order-24<\/strong>/);
  for (let i = 0; i < 2; i++) {
    const href = html.match(/href="([^"]+)">Next orders/)[1].replaceAll('&amp;', '&');
    const url = new URL(href, 'https://lodge.example');
    html = render(Object.fromEntries(url.searchParams));
  }
  assert.match(html, /<strong>order-24<\/strong> · paid/);
  assert.match(html, /Previous orders/);
  assert.doesNotMatch(html, /Next orders/);
});
test('paid status navigation resets pagination and finds older paid orders', () => {
  const html = render({ page: '2' });
  const href = html.match(/href="([^"]+status=paid[^"]+)"/)[1].replaceAll('&amp;', '&');
  const filtered = render(Object.fromEntries(new URL(href, 'https://lodge.example').searchParams));
  assert.match(filtered, /<strong>order-24<\/strong>/);
  assert.match(filtered, /1 matching orders · Page 1 of 1/);
  assert.doesNotMatch(filtered, /<strong>order-0<\/strong>/);
});
test('empty filters and invalid/out-of-range pages remain navigable', () => {
  assert.match(render({ status: 'paid', page: '999' }), /Page 1 of 1/);
  assert.match(render({ status: 'needs_review' }), /No matching orders/);
  for (const page of ['0', '-1', '1.5', 'bad']) assert.match(render({ page }), /Page 1 of 3/);
  assert.match(render({ status: 'bad', page: '999' }), /Page 3 of 3/);
});
test('paused and production gates prevent even client initialization', async () => {
  for (const env of [{}, { VERCEL_ENV: 'preview' }, { VERCEL_ENV: 'production', KPL_STAY_COMMERCE_ENABLED: 'true' }]) {
    await assert.rejects(navigation.readOwnerOrders({ env, client: () => assert.fail('no credential read'), fetcher: () => assert.fail('no network') }));
  }
});
test('enabled isolated preview uses only an authenticated read and rejects failed responses', async () => {
  const env = { VERCEL_ENV: 'preview', KPL_STAY_COMMERCE_ENABLED: 'true' };
  const client = () => ({ base: 'https://isolated.example/api/stayos/booking', key: 'test-only' });
  const data = await navigation.readOwnerOrders({ env, client, fetcher: async (url, init) => {
    assert.equal(url, 'https://isolated.example/api/stayos/store/orders');
    assert.equal(init.method, 'GET');
    assert.equal(init.headers['X-PJ-Mercantile-Role'], 'owner');
    assert.equal(init.headers.Authorization, 'Bearer test-only');
    assert.equal(init.body, undefined);
    return { ok: true, json: async () => ({ success: true, data: orders }) };
  } });
  assert.equal(data, orders);
  for (const payload of [{ success: false }, { success: true, data: {} }]) {
    await assert.rejects(navigation.readOwnerOrders({ env, client, fetcher: async () => ({ ok: true, json: async () => payload }) }));
  }
});
