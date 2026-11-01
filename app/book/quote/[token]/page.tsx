import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { directBookingEnabled, paymentConfigured, findQuote, usd, hostContactHref, publicError } from '@/lib/booking-db';
import { stayNights, quoteHasPaymentWindow } from '@/lib/booking.mjs';
import { publicBookingState } from '@/lib/kpl-booking-core.mjs';
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
  const resume = state === 'quote' && quote.status === 'checkout' && payment === 'cancel';
  const total = quote.total_cents ?? 0;
  const deposit = quote.deposit_cents ?? 0;
  const price = guestPriceBreakdown(quote, nights);
  return <main id="main-content" className="content-section booking-page booking-quote">
    <p className="eyebrow">The Lodge at Kendall Pond</p>
    <h1>{state === 'confirmed' ? 'Your stay is booked' : 'Review your stay'}</h1>
    <p>{new Date(quote.check_in + 'T12:00:00Z').toLocaleDateString('en-US', {month:'short',day:'numeric',timeZone:'UTC'})}–{new Date(quote.check_out + 'T12:00:00Z').toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric',timeZone:'UTC'})} · {nights} {nights === 1 ? 'night' : 'nights'} · {quote.guests} guests{quote.pets > 0 ? ` · ${quote.pets} pets` : ''}</p>
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
    {resume && state === 'quote' && <p className="booking-alert" role="status">Checkout paused. Your stay is not confirmed yet. You can resume secure payment below.</p>}
    {state === 'checking' && <p className="booking-alert" role="status">We’re confirming your payment. Please refresh in a moment to see your booking. Don’t pay again while we check.</p>}
    {state === 'refund_review' && <p className="booking-alert" role="alert">Your payment needs refund review. These dates are not confirmed. Do not pay again; contact your hosts for the next step.</p>}
    {state === 'needs_attention' && <p className="booking-alert" role="alert">Your payment is recorded, but the stay needs host attention before we can confirm it. Please contact your hosts; do not pay again.</p>}
    {payment && !['return', 'cancel'].includes(payment) && <p className="booking-alert" role="alert">{publicError(payment)}</p>}
    {state === 'expired' && <p className="booking-alert">This payment link has expired. Choose your dates again or contact Nate & Allie.</p>}
    <div className="booking-grid">
      <section className="booking-panel"><h2>Price details</h2>
        <dl className="booking-totals">
          <div><dt>Stay · {nights} {nights === 1 ? 'night' : 'nights'} (cleaning included)</dt><dd>{usd(price.stay_cents)}</dd></div>
          {(quote.pets > 0 || price.pet_cents > 0) && <div><dt>Pets · {quote.pets}</dt><dd>{usd(price.pet_cents)}</dd></div>}
          {price.other_cents > 0 && <div><dt>{price.other_label}</dt><dd>{usd(price.other_cents)}</dd></div>}
          <div><dt>Taxes</dt><dd>{usd(price.tax_cents)}</dd></div>
          <div className="booking-total"><dt>Total</dt><dd>{usd(total)}</dd></div>
          <div><dt>Pay now</dt><dd>{usd(deposit)}</dd></div>
          <div><dt>Pay later</dt><dd>{usd(total - deposit)}</dd></div>
        </dl>
        <p className="booking-fine">The stay price covers all {quote.guests} guests. You’re paying a deposit today; the balance is due under the terms shown.</p>
        {!price.matches_total && <p className="booking-alert" role="alert">The price breakdown needs host review. Please do not pay until the total is corrected.</p>}
      </section>
      <section className="booking-panel"><h2>Booking details</h2>
        <h3>Cancellation and refunds</h3><p className="booking-terms">{quote.cancellation_terms}</p>
        <h3>Remaining balance</h3><p className="booking-terms">{quote.balance_terms}</p>
        <h3>Stay rules</h3><p>Check-in after 3 PM; checkout before 11 AM. Self check-in uses a lockbox. Quiet hours are 10 PM–7 AM. No smoking. Up to two pets are welcome. The exterior Ring doorbell camera faces the entrance.</p>
        <p>Reserve by {quote.quote_expires ? new Date(quote.quote_expires).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }) : '—'} ET.</p>
        {price.matches_total && open && directBookingEnabled() && paymentConfigured() && state === 'quote' && <form action={payDeposit} className="booking-form">
          <input type="hidden" name="token" value={token} />
          <label className="booking-check"><input type="checkbox" name="accepted" value="yes" required /> I agree to the price, payment terms, cancellation policy, and house rules.</label>
          <button className="button button-primary" type="submit">{resume ? 'Resume payment' : `Reserve · ${usd(deposit)} deposit`}</button>
        </form>}
      </section>
    </div>
    <p><Link href="/book">← Change dates</Link> · <a href={hostContactHref()}>Contact Nate &amp; Allie</a></p>
  </main>;
}
