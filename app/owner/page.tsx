import type { Metadata } from 'next';
import Link from 'next/link';
import { BookingBrand } from '@/app/_components/BookingBrand';
import { requireKplOwner } from '@/lib/require-kpl-owner';
import { lockOwner } from './access/actions';
export const metadata: Metadata = { title: 'Lodge owner controls', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function OwnerPage() {
  await requireKplOwner();
  return <main id="main-content" className="content-section booking-page">
    <BookingBrand owner /><p className="eyebrow">Lodge at Kendall Pond</p><h1>Your Lodge desk.</h1>
    <p>Manage direct bookings and the little self-serve shop from one place.</p>
    <div className="booking-grid">
      <section className="booking-panel"><h2>Direct bookings</h2><p>See who is ready to pay, who is in checkout, and anything that actually needs your attention.</p><Link className="button button-primary" href="/owner/bookings">Open bookings</Link></section>
      <section className="booking-panel"><h2>Mercantile</h2><p>See the eleven current Stripe product links, prices and pickup instructions.</p><Link className="button button-secondary" href="/owner/store">Open the store</Link></section>
      <section className="booking-panel"><h2>Booking setup</h2><p>See connection status, pricing policy, payment settings, and calendar safeguards.</p><Link className="button button-secondary" href="/owner/settings">Open booking setup</Link></section>
    </div>
    <form action={lockOwner}><button className="button button-secondary" type="submit">Sign out</button></form>
  </main>;
}
