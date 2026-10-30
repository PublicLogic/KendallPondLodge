import { NextRequest, NextResponse } from 'next/server';
import { bookingClient } from '@/lib/booking-db';
import { handlePaymentWebhook } from '@/lib/kpl-booking-core.mjs';

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
  const result = await handlePaymentWebhook({
    body, signature: request.headers.get('stripe-signature'), env: process.env,
    // Lazily instantiate: malformed or unrelated events cannot reach the booking store.
    pj: { confirmPayment: (id: string, session: string, amount: number) => bookingClient().confirmPayment(id, session, amount) },
  });
  if (result.outcome && result.outcome !== 'confirmed') {
    // No tokens/PII. PJ has a reconciliation record except for the unmatched-scope outcome.
    console.error('KPL payment requires owner review:', result.outcome);
  }
  return NextResponse.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
}
