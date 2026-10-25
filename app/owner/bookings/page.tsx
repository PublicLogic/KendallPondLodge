import type { Metadata } from 'next';
import Link from 'next/link';
import { bookingConfigured, bookingDb, bookingAttention, type BookingAttention, type Booking, usd, publicError } from '@/lib/booking-db';
import { nightsBetween, quoteHasPaymentWindow } from '@/lib/booking.mjs';
import { airbnbStayStatus, fetchAirbnbIcs } from '@/lib/airbnb-ical.mjs';
import { BookingBrand } from '@/app/_components/BookingBrand';
import { requireKplOwner } from '@/lib/require-kpl-owner';
import { issueQuote, releaseQuote, resolvePaymentProblem } from './actions';

export const metadata: Metadata = { title: 'Direct booking requests', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function OwnerBookings({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireKplOwner('/owner/bookings');
  const { status } = await searchParams;
  let attention: BookingAttention | null = null;
  let attentionFailed = false;
  const configured = bookingConfigured();
  let requests: Booking[] = [];
  let failed = false;
  if (configured) {
    try { requests = await bookingDb<Booking[]>('kpl_booking_requests?select=*&order=created_at.desc&limit=100'); }
    catch { failed = true; }
    try { attention = await bookingAttention(); } catch { attentionFailed = true; }
  }
  // Recheck on each owner visit. Quoted links are shown only after the owner's
  // Airbnb block is visible for every night; the payment action checks again.
  let airbnbIcs: string | null = null;
  let airbnbCheckFailed = false;
  if (requests.some((request) => ['requested', 'quoted'].includes(request.status))) {
    try { airbnbIcs = await fetchAirbnbIcs({ fresh: true }); }
    catch { airbnbCheckFailed = true; }
  }
  return <main id="main-content" className="content-section booking-page">
    <BookingBrand owner /><p className="eyebrow">Owner dashboard</p>
    <h1>Direct booking requests</h1>
    <p>Check that the dates are free, then issue the exact quote. Immediately block every quoted night on Airbnb. Refresh this page and send the private link only when the block is verified below. An unpaid quote expires after up to 48 hours; once Checkout starts, its hold remains until payment confirms or you verify the Stripe session and release it.</p>
    <p><Link href="/owner">← Owner dashboard</Link> · <Link href="/owner/settings">Booking setup</Link></p>
    {status && <p role="status" className="booking-alert">{status === 'quoted' ? 'Quote issued. Block every quoted night on Airbnb, then refresh before sending the link.' : status === 'released' ? 'Unpaid hold released. Verify there is no payment or other reservation before changing Airbnb dates.' : status === 'resolved' ? 'Your correction note was recorded. This did not issue a refund or cancel a stay.' : publicError(status)}</p>}
    {!configured && <p className="booking-alert">Booking storage is not configured. See the setup guide.</p>}
    {failed && <p className="booking-alert">Booking storage is unavailable. Please check configuration.</p>}
    {attentionFailed && <p className="booking-alert" role="alert">Payment follow-up is temporarily unavailable. Check Stripe before releasing any dates.</p>}
    {attention && <section className="booking-panel"><h2>Needs attention</h2>
      {attention.items.filter(item => item.problems.some(p => p.severity === 'action')).length === 0 ? <p>No payment issues reported by PJ.</p> :
      attention.items.filter(item => item.problems.some(p => p.severity === 'action')).map((item, index) => {
        const bookingId = item.id ?? item.booking_id ?? item.booking_request_id;
        const canResolve = item.problems.some(p => ['refund_required', 'payment_rejected'].includes(p.code));
        return <article key={bookingId ?? index}><h3>{item.check_in} → {item.check_out}</h3>
          {item.problems.map((p, i) => <p key={i}>{p.message}</p>)}
          <p>Check the payment in Stripe. Refund or correct it there first. This page does not send refunds or cancel confirmed stays.</p>
          {bookingId && canResolve && <form action={resolvePaymentProblem} className="booking-form"><input type="hidden" name="id" value={bookingId} />
            <label>Correction or refund reference<textarea name="note" minLength={3} maxLength={500} required /></label>
            <label className="booking-check"><input type="checkbox" name="correction_done" value="yes" required /> I have already completed and checked the correction in Stripe.</label>
            <button type="submit" className="button button-secondary">Record completed correction</button></form>}
        </article>;
      })}
    </section>}
    {!failed && configured && requests.length === 0 && <p className="booking-alert">No requests yet. Guests can send dates from the public booking page without signing in.</p>}
    {requests.map((request) => {
      const stayStatus = airbnbIcs && ['requested', 'quoted'].includes(request.status)
        ? airbnbStayStatus(airbnbIcs, nightsBetween(request.check_in, request.check_out)) : null;
      const quoteOpen = request.status === 'quoted' && quoteHasPaymentWindow(request.quote_expires);
      return <article className="booking-panel" key={request.id}>
      <div className="booking-request-head"><div><h2>{request.check_in} → {request.check_out}</h2><p>{request.guest_name} · {request.guest_email} · {request.guests} guests · {request.pets} pets</p></div><strong>{request.status}</strong></div>
      {request.note && <p>{request.note}</p>}
      {request.status === 'requested' && airbnbCheckFailed && <p className="booking-alert">Couldn't check Airbnb — try again before quoting.</p>}
      {request.status === 'requested' && !airbnbCheckFailed && stayStatus !== 'free' && <p className="booking-alert">These dates already show blocked on Airbnb. A quote cannot be issued; check the Airbnb calendar.</p>}
      {request.status === 'requested' && !airbnbCheckFailed && stayStatus === 'free' && <form action={issueQuote} className="booking-form">
        <input type="hidden" name="id" value={request.id} />
        <p>These prices and terms apply only to this quote. They are not saved as property-wide pricing settings.</p><div className="booking-fields">
          <label>Nightly rate ($)<input name="nightly" type="number" min="0.01" max="999999" step="0.01" required /></label>
          <label>Cleaning ($)<input name="cleaning" type="number" min="0" step="0.01" defaultValue="0" required /></label>
          <label>Pets ($)<input name="pet" type="number" min="0" step="0.01" defaultValue="0" required /></label>
          <label>Taxes ($)<input name="tax" type="number" min="0" step="0.01" defaultValue="0" required /></label>
          <label>Other fee ($)<input name="other" type="number" min="0" step="0.01" defaultValue="0" required /></label>
          <label>Other fee name<input name="other_label" maxLength={80} /></label>
          <label>Deposit due now ($)<input name="deposit" type="number" min="0.01" step="0.01" required /></label>
        </div>
        <label>Cancellation and refund terms<textarea name="cancellation_terms" minLength={20} maxLength={2000} required placeholder="State the exact cancellation deadline, refund amount, and any nonrefundable portion." /></label>
        <label>Remaining balance terms<textarea name="balance_terms" minLength={20} maxLength={1000} required placeholder="State when and how the balance will be collected." /></label>
        <label className="booking-check"><input name="availability_checked" value="yes" type="checkbox" required /> I will block these dates on Airbnb immediately after issuing the quote and before sending its link.</label>
        <button className="button button-primary" type="submit">Issue quote and hold dates in KPL</button>
      </form>}
      {['quoted','checkout','confirmed'].includes(request.status) && <div>
        <p>Stay total: {usd(request.total_cents ?? 0)} · Deposit: {usd(request.deposit_cents ?? 0)} · Balance: {usd((request.total_cents ?? 0) - (request.deposit_cents ?? 0))}</p><p>{request.balance_terms}</p>{request.refund_reason && <p className="booking-alert">Payment needs refund review. This is not a confirmed stay.</p>}{request.reservation_sync_error && <p className="booking-alert">The payment is recorded, but the stay record needs attention. Do not tell the guest the booking is complete.</p>}
        {request.status === 'quoted' && !quoteOpen && <p className="booking-alert">This quote no longer has enough time for payment. Release the hold, then unblock Airbnb; ask the guest for a new request if needed.</p>}
        {request.status === 'quoted' && quoteOpen && airbnbCheckFailed && <p className="booking-alert">Couldn't verify the Airbnb block. Do not send the quote; refresh when the calendar is available.</p>}
        {request.status === 'quoted' && quoteOpen && !airbnbCheckFailed && stayStatus === 'conflict' && <p className="booking-alert">Airbnb shows a reservation or unrecognized block. Do not send this quote; investigate the dates.</p>}
        {request.status === 'quoted' && quoteOpen && !airbnbCheckFailed && stayStatus !== 'owner-blocked' && stayStatus !== 'conflict' && <p className="booking-alert">Block every quoted night on Airbnb, wait for its calendar to update, then refresh. Do not send the link yet.</p>}
        {request.status === 'quoted' && quoteOpen && !airbnbCheckFailed && stayStatus === 'owner-blocked' && <p>Airbnb block verified. Private quote ready to send: <Link href={`/book/quote/${request.quote_token}`}>{`/book/quote/${request.quote_token}`}</Link></p>}
        {request.status !== 'quoted' && <p>Private quote: <Link href={`/book/quote/${request.quote_token}`}>{`/book/quote/${request.quote_token}`}</Link></p>}
        <p>Quote expiration: {request.quote_expires ? new Date(request.quote_expires).toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' ET' : '—'}</p>
        {request.status === 'checkout' && <p>Checkout has started. Do not unblock dates until Stripe confirms the session expired or the payment is reconciled.</p>}
        {request.status !== 'confirmed' && <form action={releaseQuote} className="booking-form"><input type="hidden" name="id" value={request.id} /><button className="button button-secondary" type="submit">Release unpaid hold</button></form>}
      </div>}
      {request.status === 'expired' && <p>Expired. Check Stripe, any refund follow-up, and other reservations before changing the Airbnb block.</p>}
    </article>;
    })}
  </main>;
}
