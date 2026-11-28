import type { Metadata } from 'next';
import Link from 'next/link';
import { requireKplOwner } from '@/lib/require-kpl-owner';
import { bookingClient } from '@/lib/booking-db';
import { mercantileOwnerPreviewEnabled, readOwnerOrders } from '@/lib/mercantile-owner-orders.mjs';
import { Orders, type OwnerStoreOrder } from './Orders';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Mercantile order review', robots: { index: false, follow: false } };

export default async function OwnerStore({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  await requireKplOwner('/owner/store');
  let orders: OwnerStoreOrder[] | undefined;
  if (mercantileOwnerPreviewEnabled()) {
    try { orders = await readOwnerOrders({ client: bookingClient }); } catch { /* fail closed */ }
  }
  const query = await searchParams;
  return <main id="main-content" className="content-section booking-page">
    <Link href="/owner">← Lodge dashboard</Link>
    <h1>Mercantile order review.</h1>
    {orders ? <Orders orders={orders} status={query.status} page={query.page} /> :
      <p role="status">Governed order review is paused or unavailable. No local order data is substituted. This read-only route requires an explicitly enabled, isolated PJ preview.</p>}
  </main>;
}
