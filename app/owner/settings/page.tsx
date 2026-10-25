import type { Metadata } from 'next';
import Link from 'next/link';
import { bookingClient, bookingConfigured, directBookingEnabled, paymentConfigured } from '@/lib/booking-db';
import { requireKplOwner } from '@/lib/require-kpl-owner';
import { BookingBrand } from '@/app/_components/BookingBrand';
import { syncAirbnbCalendar } from './actions';
export const metadata: Metadata = { title: 'Booking setup', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function BookingSettings({
  searchParams,
}: {
  searchParams: Promise<{ calendar?: string; events?: string }>;
}) {
  await requireKplOwner('/owner/settings');
  const query = await searchParams;
  let store = 'Not set up', calendar = 'Not set up';
  if (bookingConfigured()) {
    try {
      const status = await bookingClient().contentStatus();
      store = 'Connected';
      calendar = status.calendarConfigured ? 'Source registered' : 'Not set up';
    } catch { store = 'Needs attention'; calendar = 'Needs attention'; }
  }
  const guestEmail = process.env.KPL_BOOKING_CONTACT_EMAIL?.trim() || 'info@publiclogic.org';
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
      </dl>
      {query.calendar === 'registered' && <p className="booking-alert" role="status">Airbnb calendar synced with PJ{query.events ? ` · ${query.events} calendar events read` : ''}.</p>}
      {query.calendar === 'missing' && <p className="booking-alert" role="alert">Airbnb calendar source is not configured on this deployment.</p>}
      {query.calendar === 'unverified' && <p className="booking-alert" role="alert">PJ did not confirm the calendar source after registration.</p>}
      {query.calendar === 'error' && <p className="booking-alert" role="alert">Calendar sync failed. No booking or payment was changed.</p>}
      <form action={syncAirbnbCalendar}>
        <button className="button button-secondary" type="submit">Sync Airbnb calendar</button>
      </form>
      <p>Registration is not proof of availability. The calendar is checked again when quoting and before checkout. Payment setup does not verify a transaction.</p>
      <p>Connection keys, calendar links, and payment secrets stay on the server. The sync action uses them in the server runtime and never displays the private Airbnb URL.</p></section>
      <section className="booking-panel"><h2>Pricing & terms</h2><p>Nightly rate, cleaning, pets, taxes, other fees and the exact deposit are entered on each quote. There are no saved price defaults here.</p>
        <p>Include complete cancellation/refund terms and balance-payment terms. This checkout charges only the quoted deposit; it does not schedule the balance.</p>
        <p>Quotes last up to 48 hours, capped at the arrival date. More than 65 minutes must remain to start payment.</p>
        <p>Any active PJ booking policy is enforced by PJ. Policy changes are not editable here and cannot be bypassed by this interface.</p>
      </section>
      <section className="booking-panel"><h2>Guest communication</h2><p><strong>Guest-facing identity:</strong> The Lodge at Kendall Pond &lt;{guestEmail}&gt;</p><p>Outbound guest messaging belongs to PuddleJumper. KPL records the booking and provides the property/contact identity; PJ governs sender authorization, message state, retries, provider delivery, and audit.</p><p><strong>Manual delivery</strong> until PJ messaging is enabled and an authorized sender can send as info@publiclogic.org.</p></section>
      <section className="booking-panel"><h2>Owner access & cancellations</h2><p>Owner-code sign-in uses a signed session that expires after 12 hours. Guests never need this code.</p><p>Only unpaid holds can be released here. For a paid stay, handle the guest’s cancellation and any refund with Stripe and the booking operator. Recording a correction note does not cancel the reservation or issue a refund.</p><p>This first release uses light mode.</p></section>
    </div>
  </main>;
}
