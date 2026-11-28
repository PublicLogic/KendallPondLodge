import Link from 'next/link';
import { ownerOrderPage, ownerOrdersHref } from '@/lib/mercantile-owner-orders.mjs';

export type OwnerStoreOrder = {
  id: string; product_id: string; quantity: number; total_cents: number;
  status: string; created_at: string;
};

export function Orders({ orders, status, page }: { orders: OwnerStoreOrder[]; status?: string; page?: string }) {
  const selected = ownerOrderPage(orders, status, page);
  return <section className="booking-panel">
    <h2>Orders</h2>
    <nav aria-label="Order status">
      {['all', 'paid', 'needs_review', 'fulfilled', 'reserved', 'checkout', 'expired'].map(value =>
        <Link key={value} href={ownerOrdersHref(value)} aria-current={selected.status === value ? 'page' : undefined}>
          {value.replaceAll('_', ' ')}{' · '}
        </Link>)}
    </nav>
    <p>{selected.total} matching orders · Page {selected.page} of {selected.pages}</p>
    {selected.orders.length === 0 ? <p>No matching orders.</p> : <ul>
      {selected.orders.map(order => <li key={order.id}>
        <strong>{order.id}</strong> · {order.status.replaceAll('_', ' ')} · Quantity {order.quantity} ·{' '}
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.total_cents / 100)}
        <p>Product {order.product_id} · Created {order.created_at}</p>
      </li>)}
    </ul>}
    <nav aria-label="Order pages">
      {selected.page > 1 && <Link href={ownerOrdersHref(selected.status, selected.page - 1)}>Previous orders</Link>}
      {' '}
      {selected.page < selected.pages && <Link href={ownerOrdersHref(selected.status, selected.page + 1)}>Next orders</Link>}
    </nav>
    <p>Read-only preview. Collection, inventory and payment state cannot be changed here.</p>
    <p>PJ returns only the newest 100 orders. These pages cover that returned window, not the full order history.</p>
  </section>;
}
