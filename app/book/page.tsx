import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/app/_components/PageHero';
import { directBookingEnabled } from '@/lib/booking-db';
import { requestStay } from './actions';
import { BookingBrand } from '@/app/_components/BookingBrand';
import { publicError } from '@/lib/booking-db';

export const metadata: Metadata = {
  title: 'Request a direct stay',
  description: 'Request dates at the Lodge at Kendall Pond. The host verifies availability and sends an itemized direct booking quote before any payment.',
};
export const dynamic = 'force-dynamic';

const airbnb = 'https://www.airbnb.com/rooms/1667597913565948713';

export default async function BookPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const enabled = directBookingEnabled();
  return <main id="main-content" className="booking-page">
    <PageHero eyebrow="The Lodge at Kendall Pond · Gardner, MA" title="Your stay starts here." intro="A private waterfront home for up to eight guests: three bedrooms, four beds, and two baths. Request your dates and we’ll check availability before sending a complete quote." image="/images/kpl/pond.jpg" imageAlt="Kendall Pond and the lodge shoreline" secondaryAction={{ href: '/lodge', label: 'Explore the lodge' }} />
    <section className="content-section booking-grid">
      <div>
        <p className="eyebrow">Direct booking</p>
        <h2>Request your dates.</h2>
        <p>We check the Airbnb calendar and block available dates before offering a direct stay. Your request is free and does not reserve the property. You’ll receive a private quote showing lodging, cleaning, pet fees, taxes, any other fee, the deposit, remaining balance, and cancellation terms before paying.</p>
        <p>The lodge sleeps up to eight. If your group has five to eight guests, tell us how your group plans to use the king, queen, and bunk beds so we can confirm the fit.</p>
        <ol className="booking-steps"><li>Send your dates and party size.</li><li>We verify availability and send an itemized quote.</li><li>Review the terms and pay your deposit securely through Stripe. Your stay is confirmed after payment is recorded.</li></ol>
        <p>Prefer an immediate calendar and checkout? <a href={airbnb} target="_blank" rel="noreferrer">Reserve on Airbnb ↗</a></p>
      </div>
      <div className="booking-panel">
        <BookingBrand /><h2>Ask about a stay</h2><p>No account or sign-in needed.</p>
        {status === 'received' && <p className="booking-alert" role="status">Request received. This is not a reservation. The host will contact you about availability and a quote.</p>}
        {status && status !== 'received' && <p className="booking-alert" role="alert">{publicError(status)} Your dates are not reserved.</p>}
        {!enabled ? <p className="booking-alert">Direct requests are not open yet. You can check live availability and book on <a href={airbnb}>Airbnb</a>.</p> :
          <form action={requestStay} className="booking-form">
            <div className="booking-fields">
              <label>Check in<input name="check_in" type="date" required /></label>
              <label>Check out<input name="check_out" type="date" required /></label>
              <label>Guests<input name="guests" type="number" min="1" max="8" defaultValue="2" required /></label>
              <label>Pets (up to two)<input name="pets" type="number" min="0" max="2" defaultValue="0" required /></label>
              <label>Your name<input name="guest_name" type="text" autoComplete="name" maxLength={100} required /></label>
              <label>Email<input name="guest_email" type="email" autoComplete="email" maxLength={254} required /></label>
            </div>
            <label>Anything we should know? <span>(optional)</span><textarea name="note" maxLength={1000} /></label>
            <div className="booking-honeypot" aria-hidden="true"><label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div>
            <label className="booking-check"><input type="checkbox" name="consent" value="yes" required /> I understand this is a request, not a reservation, and the hosts may contact me about this stay.</label>
            <button className="button button-primary" type="submit">Request dates</button>
            <p className="booking-fine">No charge now. A request is not a confirmed booking. We’ll use these details only to respond to your stay request.</p>
          </form>}
      </div>
    </section>
    <section className="content-section surface-section"><h2>The lodge at a glance</h2><p>Private pond access, dock, kayaks, hot tub, firepit, and an open kitchen for gathering. <Link href="/grounds">Explore the grounds</Link> or <Link href="/rates">see rates and availability</Link>.</p><p>Check-in after 3 PM; checkout before 11 AM. Quiet hours are 10 PM–7 AM. No smoking. An exterior Ring doorbell camera faces the entrance.</p></section>
  </main>;
}
