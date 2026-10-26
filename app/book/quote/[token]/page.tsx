import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { directBookingEnabled, paymentConfigured, findQuote, usd, hostContactHref, publicError } from '@/lib/booking-db';
import { stayNights, quoteHasPaymentWindow } from '@/lib/booking.mjs';
import { publicBookingState } from '@/lib/kpl-booking-core.mjs';
import { BookingBrand } from '@/app/_components/BookingBrand';
import { payDeposit } from '@/app/book/actions';

export const metadata: Metadata = { title: 'Your private stay quote', robots: { index: false, follow: false } };
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
  return <main id="main-content" className="content-section booking-page booking-quote">
    <BookingBrand /><p className="eyebrow">Private direct booking quote</p>
    <h1>Your stay at Kendall Pond.</h1>
    <p>{quote.check_in} to {quote.check_out} · {nights} {nights === 1 ? 'night' : 'nights'} · {quote.guests} guests · {quote.pets} pets</p>
    <p>This quote is for the dates above only. Keep this link private. Review all charges and terms before paying.</p>
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
    {state === 'expired' && <p className="booking-alert">This quote is no longer open for payment. Ask your hosts to check the dates again and issue a new quote.</p>}
    <div className="booking-grid">
      <section className="booking-panel"><h2>Complete price</h2>
        <dl className="booking-totals">
          <div><dt>{nights} nights × {usd(quote.nightly_cents ?? 0)}</dt><dd>{usd(nights * (quote.nightly_cents ?? 0))}</dd></div>
          <div><dt>Cleaning</dt><dd>{usd(quote.cleaning_cents ?? 0)}</dd></div>
          <div><dt>Pets</dt><dd>{usd(quote.pet_cents ?? 0)}</dd></div>
          <div><dt>Taxes</dt><dd>{usd(quote.tax_cents ?? 0)}</dd></div>
          {(quote.other_cents ?? 0) > 0 && <div><dt>{quote.other_label}</dt><dd>{usd(quote.other_cents ?? 0)}</dd></div>}
          <div className="booking-total"><dt>Full stay total</dt><dd>{usd(total)}</dd></div>
          <div><dt>Deposit due now</dt><dd>{usd(deposit)}</dd></div>
          <div><dt>Balance after deposit</dt><dd>{usd(total - deposit)}</dd></div>
        </dl>
        <p className="booking-fine">The deposit is charged in USD by Stripe. The remaining balance is not charged by this checkout.</p>
      </section>
      <section className="booking-panel"><h2>Terms before payment</h2>
        <h3>Cancellation and refunds</h3><p className="booking-terms">{quote.cancellation_terms}</p>
        <h3>Remaining balance</h3><p className="booking-terms">{quote.balance_terms}</p>
        <h3>Stay rules</h3><p>Check-in after 3 PM; checkout before 11 AM. Self check-in uses a lockbox. Quiet hours are 10 PM–7 AM. No smoking. Up to two pets are welcome. The exterior Ring doorbell camera faces the entrance.</p>
        <p>Quote valid until {quote.quote_expires ? new Date(quote.quote_expires).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }) : '—'} ET, subject to the date hold.</p>
        {open && directBookingEnabled() && paymentConfigured() && (state === 'quote' || resume) && <form action={payDeposit} className="booking-form">
          <input type="hidden" name="token" value={token} />
          <label className="booking-check"><input type="checkbox" name="accepted" value="yes" required /> I agree to the quoted price, balance due, cancellation and refund terms, and stay rules above.</label>
          <button className="button button-primary" type="submit">{resume ? 'Check or resume your existing payment' : `Pay ${usd(deposit)} deposit with Stripe`}</button>
        </form>}
      </section>
    </div>
    <p><Link href="/book">← Direct booking information</Link> · <a href={hostContactHref()}>Contact your hosts</a></p>
  </main>;
}
