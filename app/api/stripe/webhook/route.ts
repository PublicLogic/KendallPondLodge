import { NextRequest, NextResponse } from 'next/server';
import { bookingClient } from '@/lib/booking-db';
import { handlePaymentWebhook } from '@/lib/kpl-booking-core.mjs';
import { handleMercantileWebhook } from '@/lib/mercantile-webhook.mjs';
import { catalog, type StoreOrder } from '@/lib/mercantile-runtime';

export const runtime = 'nodejs';
/** Bounded raw text: signature verification must precede JSON use. */
async function rawBody(request: NextRequest): Promise<string> {
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 200000) { await reader.cancel(); throw new Error('Payload too large'); }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}
export async function POST(request: NextRequest) {
  let body: string;
  try { body = await rawBody(request); }
  catch { return new NextResponse('Payload too large', { status: 413 }); }
  const mercantile = await handleMercantileWebhook({
    body, signature: request.headers.get('stripe-signature'), env: process.env,
    settle: (id: string, session: string, amount: number) =>
      catalog<StoreOrder>('POST', '/orders/' + id + '/payment', 'webhook',
        { stripe_session_id: session, amount_cents: amount }),
    expire: (id: string) => catalog<StoreOrder>('POST', '/orders/' + id + '/expire', 'webhook', {}),
  });
  if (mercantile) {
    if (mercantile.outcome === 'needs_review') console.error('Mercantile payment needs owner review');
    return NextResponse.json(mercantile.body, { status: mercantile.status, headers: { 'Cache-Control': 'no-store' } });
  }
  const result = await handlePaymentWebhook({
    body, signature: request.headers.get('stripe-signature'), env: process.env,
    // Lazily instantiate: malformed or unrelated events cannot reach the booking store.
    pj: {
      confirmPayment: (id: string, session: string, amount: number) => bookingClient().confirmPayment(id, session, amount),
      release: (id: string) => bookingClient().release(id),
    },
  });
  if (result.outcome && !['confirmed', 'released', 'already_settled'].includes(result.outcome)) {
    // No tokens/PII. PJ has a reconciliation record except for the unmatched-scope outcome.
    console.error('KPL payment requires owner review:', result.outcome);
  }
  return NextResponse.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
}
