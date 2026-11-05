import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import ts from 'typescript';
import { handlePaymentWebhook } from '../lib/kpl-booking-core.mjs';
import { handleMercantileWebhook } from '../lib/mercantile-webhook.mjs';

test('signed expired Checkout reaches the booking release through the deployed route', async () => {
  // Run the production route with only its external store/HTTP boundaries supplied.
  const source = readFileSync(new URL('../app/api/stripe/webhook/route.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
  const id = '10000000-0000-4000-8000-000000000001';
  const previous = { secret: process.env.STRIPE_WEBHOOK_SECRET, key: process.env.STRIPE_SECRET_KEY };
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_route_test_only';
  process.env.STRIPE_SECRET_KEY = 'sk_test_route_test_only';
  let released;
  const POST = new Function('NextResponse', 'bookingClient', 'handlePaymentWebhook', 'handleMercantileWebhook', 'catalog', `${compiled}\nreturn POST;`)(
    { json: (body, init) => Response.json(body, init) },
    () => ({ release: async bookingId => { released = bookingId; return { ok: true }; } }),
    handlePaymentWebhook,
    handleMercantileWebhook,
    async () => { throw new Error('Booking event must not touch the Mercantile ledger'); },
  );
  try {
    const body = JSON.stringify({ type: 'checkout.session.expired', livemode: false, data: { object: {
      object: 'checkout.session', id: 'cs_test_1234567890', payment_status: 'unpaid', metadata: { kpl_booking_id: id },
    } } });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${body}`).digest('hex');
    const response = await POST(new Request('https://lodge.example/api/stripe/webhook', {
      method: 'POST', body, headers: { 'stripe-signature': `t=${timestamp},v1=${signature}` },
    }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { received: true });
    assert.equal(released, id);
  } finally {
    for (const [key, value] of Object.entries({ STRIPE_WEBHOOK_SECRET: previous.secret, STRIPE_SECRET_KEY: previous.key })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
