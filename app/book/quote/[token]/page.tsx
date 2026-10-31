import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { directBookingEnabled, paymentConfigured, findQuote, usd, hostContactHref, publicError } from '@/lib/booking-db';
import { stayNights, quoteHasPaymentWindow } from '@/lib/booking.mjs';
import { publicBookingState } from '@/lib/kpl-booking-core.mjs';
import { BookingBrand } from '@/app/_components/BookingBrand';
import { payDeposit } from '@/app/book/actions';
import { guestPriceBreakdown } from '@/lib/guest-price-breakdown.mjs';

export const metadata: Metadata = { title: 'Complete your booking', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function QuotePage({ params, searchParams }: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { token } = await params;
  const { payment } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();
  let quote;
  try { quote = await findQuote(token); }
  catch { return <main id="main-content" className="content-section booking-page"><h1>Your quote is temporarily unavailable.</h1><p>We cannot check its status right now. Do not start a second payment.</p><a className="button button-secondary" href={hostContactHref()}>Contact your hosts</a></main>; }
  if (!quote || quote.status === 'requested' || quote.status === 'declined') notFound();
  const nights = stayNights(quote.check_in, quote.check_out);
  const open = ['quoted', 'checkout'].includes(quote.status) && quoteHasPaymentWindow(quote.quote_expires);
  const state = publicBookingState(quote, payment ?? '');
  const resume = quote.status === 'checkout' && payment === 'cancel' && !quote.refund_reason;
  const total = quote.total_cents ?? 0;
  const deposit = quote.deposit_cents ?? 0;
  const price = guestPriceBreakdown(quote, nights);
  return <main id="main-content" className="content-section booking-page booking-quote">
    <BookingBrand /><p className="eyebrow">Direct booking</p>
    <h1>Complete your Kendall Pond booking.</h1>
    <p>{quote.check_in} to {quote.check_out} · {nights} {nights === 1 ? 'night' : 'nights'} · {quote.guests} guests · {quote.pets} pets</p>
    <p>Review the complete price and terms, then continue to secure Stripe checkout. We recheck availability when you continue. Keep this link private.</p>
    {state === 'confirmed' && (
      <section
        className="booking-confirmed-panel"
        role="status"
      >
        <div>
          <p className="eyebrow">Confirmed</p>
          <h2>You’re booked.</h2>
          <p>
            Your {usd(deposit)} deposit is recorded for
            {` ${quote.check_in} → ${quote.check_out}`}.
          </p>
          <p>
            Remaining balance: {usd(total - deposit)}.
            {quote.balance_terms
              ? ` ${quote.balance_terms}`
              : ' Nate & Allie will follow up before arrival.'}
          </p>
        </div>

        <div className="booking-confirmed-actions">
          <Link
            className="button button-primary"
            href="/guidebook"
          >
            Open Guest Guide
          </Link>
          <a
            className="button button-secondary"
            href={hostContactHref()}
          >
            Contact Nate & Allie
          </a>
        </div>
      </section>
    )}
    {state === 'checking' && <p className="booking-alert" role="status">We’re checking the payment and booking record. A return from Stripe is not proof of a completed booking. Please don’t start another payment. Refresh this page or contact your hosts.</p>}
    {state === 'refund_review' && <p className="booking-alert" role="alert">Your payment needs refund review. These dates are not confirmed. Do not pay again; contact your hosts for the next step.</p>}
    {state === 'needs_attention' && <p className="booking-alert" role="alert">Your payment is recorded, but the stay needs host attention before we can confirm it. Please contact your hosts; do not pay again.</p>}
    {payment && !['return', 'cancel'].includes(payment) && <p className="booking-alert" role="alert">{publicError(payment)}</p>}
    {state === 'expired' && <p className="booking-alert">This payment link has expired. Choose your dates again or contact Nate & Allie.</p>}
    <div className="booking-grid">
      <section className="booking-panel"><h2>Your complete price</h2>
        <dl className="booking-totals">
          <div><dt>Stay · {nights} {nights === 1 ? 'night' : 'nights'} (cleaning included)</dt><dd>{usd(price.stay_cents)}</dd></div>
          {quote.pets > 0 && <div><dt>Pets · {quote.pets}</dt><dd>{usd(price.pet_cents)}</dd></div>}
          {price.other_cents > 0 && <div><dt>{price.other_label}</dt><dd>{usd(price.other_cents)}</dd></div>}
          <div><dt>Taxes</dt><dd>{usd(price.tax_cents)}</dd></div>}
          <div className="booking-total"><dt>Full stay total</dt><dd>{usd(total)}</dd></div>
          <div><dt>Deposit due now</dt><dd>{usd(deposit)}</dd></div>
          <div><dt>Balance after deposit</dt><dd>{usd(total - deposit)}</dd></div>
        </dl>
        <p className="booking-fine">Housekeeping is included in the stay price. Pets are priced separately if you bring them. The deposit is charged in USD by Stripe; the remaining balance is not collected here.</p>
        {!price.matches_total && <p className="booking-alert" role="alert">The price breakdown needs host review. Please do not pay until the total is corrected.</p>}
      </section>
      <section className="booking-panel"><h2>Terms before payment</h2>
        <h3>Cancellation and refunds</h3><p className="booking-terms">{quote.cancellation_terms}</p>
        <h3>Remaining balance</h3><p className="booking-terms">{quote.balance_terms}</p>
        <h3>Stay rules</h3><p>Check-in after 3 PM; checkout before 11 AM. Self check-in uses a lockbox. Quiet hours are 10 PM–7 AM. No smoking. Up to two pets are welcome. The exterior Ring doorbell camera faces the entrance.</p>
        <p>Payment link valid until {quote.quote_expires ? new Date(quote.quote_expires).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }) : '—'} ET. Availability is rechecked when you continue to payment.</p>
        {price.matches_total && open && directBookingEnabled() && paymentConfigured() && (state === 'quote' || resume) && <form action={payDeposit} className="booking-form">
          <input type="hidden" name="token" value={token} />
          <label className="booking-check"><input type="checkbox" name="accepted" value="yes" required /> I agree to the quoted price, balance due, cancellation and refund terms, and stay rules above.</label>
          <button className="button button-primary" type="submit">{resume ? 'Resume secure payment' : `Continue to Stripe · ${usd(deposit)} deposit`}</button>
        </form>}
      </section>
    </div>
    <p><Link href="/book">← Direct booking information</Link> · <a href={hostContactHref()}>Contact your hosts</a></p>
  </main>;
}
