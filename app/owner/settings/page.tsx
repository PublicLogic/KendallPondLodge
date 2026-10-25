import type { Metadata } from 'next';
import Link from 'next/link';
import { bookingClient, bookingConfigured, directBookingEnabled, paymentConfigured } from '@/lib/booking-db';
import { requireKplOwner } from '@/lib/require-kpl-owner';
import { BookingBrand } from '@/app/_components/BookingBrand';
export const metadata: Metadata = { title: 'Booking setup', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function BookingSettings() {
  await requireKplOwner('/owner/settings');
  let store = 'Not set up', calendar = 'Not set up';
  if (bookingConfigured()) {
    try {
      const status = await bookingClient().contentStatus();
      store = 'Connected';
      calendar = status.calendarConfigured ? 'Source registered' : 'Not set up';
    } catch { store = 'Needs attention'; calendar = 'Needs attention'; }
  }
  return <main id="main-content" className="content-section booking-page">
    <BookingBrand owner /><p className="eyebrow">Lodge at Kendall Pond</p><h1>Booking setup.</h1>
    <p><Link href="/owner/bookings">← Requests & bookings</Link></p>
    <div className="booking-grid">
      <section className="booking-panel"><h2>Connections</h2><dl className="booking-totals">
        <div><dt>Booking records</dt><dd>{store}</dd></div>
        <div><dt>Airbnb calendar in PJ</dt><dd>{calendar}</dd></div>
        <div><dt>Local Airbnb calendar check</dt><dd>{process.env.KPL_AIRBNB_ICAL_URL?.trim() ? 'Source configured' : 'Not set up'}</dd></div>
        <div><dt>Payment setup</dt><dd>{paymentConfigured() ? 'Configured' : 'Needs attention'}</dd></div>
        <div><dt>Direct requests</dt><dd>{directBookingEnabled() ? 'Open' : 'Closed'}</dd></div>
      </dl><p>Registration is not proof of availability. The calendar is checked again when quoting and before checkout. Payment setup does not verify a transaction.</p>
      <p>Connection keys, calendar links, and payment secrets stay on the server. Changes to them are made through hosting configuration, not this page.</p></section>
      <section className="booking-panel"><h2>Pricing & terms</h2><p>Nightly rate, cleaning, pets, taxes, other fees and the exact deposit are entered on each quote. There are no saved price defaults here.</p>
        <p>Include complete cancellation/refund terms and balance-payment terms. This checkout charges only the quoted deposit; it does not schedule the balance.</p>
        <p>Quotes last up to 48 hours, capped at the arrival date. More than 65 minutes must remain to start payment.</p>
        <p>Any active PJ booking policy is enforced by PJ. Policy changes are not editable here and cannot be bypassed by this interface.</p>
      </section>
      <section className="booking-panel"><h2>Guest communication</h2><p><strong>Guest-facing identity:</strong> The Lodge at Kendall Pond &lt;info@publiclogic.org&gt;</p><p>Outbound guest messaging belongs to PuddleJumper. KPL records the booking and provides the property/contact identity; PJ governs sender authorization, message state, retries, provider delivery, and audit.</p><p>Until PJ messaging is enabled and an authorized sender can send as info@publiclogic.org, quote delivery remains manual.</p></section>
      <section className="booking-panel"><h2>Owner access & cancellations</h2><p>Owner-code sign-in uses a signed session that expires after 12 hours. Guests never need this code.</p><p>Only unpaid holds can be released here. For a paid stay, handle the guest’s cancellation and any refund with Stripe and the booking operator. Recording a correction note does not cancel the reservation or issue a refund.</p><p>This first release uses light mode.</p></section>
    </div>
  </main>;
}
