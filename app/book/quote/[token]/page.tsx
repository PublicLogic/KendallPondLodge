import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { directBookingEnabled, paymentConfigured, findQuote, usd, hostContactHref, publicError } from '@/lib/booking-db';
import { stayNights, quoteHasPaymentWindow } from '@/lib/booking.mjs';
import { publicBookingState } from '@/lib/kpl-booking-core.mjs';
import { BookingBrand } from '@/app/_components/BookingBrand';
import { payDeposit } from '@/app/book/actions';

export const metadata: Metadata = { title: 'Review & book your stay', robots: { index: false, follow: false } };
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
  const open = ['quoted', 'checkout'].includes(quote.status) && quoteHa¶»§q«^