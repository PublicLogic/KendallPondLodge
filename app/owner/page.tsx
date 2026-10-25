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
    <BookingBrand owner /><p className="eyebrow">Lodge at Kendall Pond</p><h1>Your booking desk.</h1>
    <p>Review requests, prepare exact quotes, and follow payments through to a recorded stay.</p>
    <div className="booking-grid">
      <section className="booking-panel"><h2>Requests & bookings</h2><p>Price each stay, verify the Airbnb block, and share the guest’s private quote.</p><Link className="button button-primary" href="/owner/bookings">Open bookings</Link></section>
      <section className="booking-panel"><h2>Booking setup</h2><p>See connection status and how the booking process works. Rates and terms are entered on each quote.</p><Link className="button button-secondary" href="/owner/settings">Open booking setup</Link></section>
    </div>
    <form action={lockOwner}><button className="button button-secondary" type="submit">Sign out</button></form>
  </main>;
}
