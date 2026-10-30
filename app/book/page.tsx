import type { Metadata } from 'next';
import Link from 'next/link';

import {
  bookingClient,
  directBookingEnabled,
  publicError,
  type Booking,
} from '@/lib/booking-db';

import {
  blockedNightsFromIcs,
  fetchAirbnbIcs,
} from '@/lib/airbnb-ical.mjs';

import {
  nightsBetween,
  propertyToday,
} from '@/lib/booking.mjs';

import { requestStay } from './actions';
import { BookingSteps } from '@/app/_components/StayInformation';
import { StayRequestForm } from './StayRequestForm';
import styles from './book.module.css';

export const metadata: Metadata = {
  title: 'Book the Lodge | Dates & Availability',
  alternates: { canonical: '/book' },
  description:
    'Check dates and full pricing for The Lodge at Kendall Pond in Gardner, Massachusetts. Book direct when available or continue through Airbnb.',
};

export const dynamic = 'force-dynamic';

const airbnb =
  'https://www.airbnb.com/rooms/1667597913565948713';

const BLOCKING_DIRECT_STATUSES = new Set([
  'quoted',
  'checkout',
  'confirmed',
]);

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const enabled = directBookingEnabled();
  let instant = false;
  if (enabled) {
    try {
      instant = (await bookingClient().instantSettings())?.enabled === true;
    } catch {
      instant = false;
    }
  }
  const bookable = enabled && instant;
  const today = propertyToday();

  const unavailable = new Set<string>();
  let availabilityReady = enabled;

  if (enabled) {
    try {
      const ics = await fetchAirbnbIcs({ fresh: true });

      for (const night of blockedNightsFromIcs(ics)) {
        unavailable.add(night);
      }
    } catch {
      availabilityReady = false;
    }

    try {
      const bookings =
        (await bookingClient().list(100)) as Booking[];

      for (const booking of bookings) {
        if (!BLOCKING_DIRECT_STATUSES.has(booking.status)) {
          continue;
        }

        for (
          const night of nightsBetween(
            booking.check_in,
            booking.check_out,
          )
        ) {
          unavailable.add(night);
        }
      }
    } catch {
      availabilityReady = false;
    }
  }

  const readyToBook = bookable && availabilityReady;

  return (
    <main
      id="main-content"
      className={"booking-page booking-page-direct " + styles.page}
      data-booking-editorial
    >
      <section className={styles.frame} aria-labelledby="booking-title">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>The Lodge at Kendall Pond · Direct booking</p>
          <h1 id="booking-title">Book the Lodge.</h1>
          <p className={styles.lede}>
            {readyToBook
              ? "Choose your dates, see the full price, and review the terms before you pay. Nate and Allie host the house and live nearby."
              : enabled
                ? "Instant direct booking is being set up. For now, Airbnb has the current calendar and secure checkout."
                : "Direct booking is paused for now. You can check available dates and reserve the Lodge through Airbnb."}
          </p>

          <dl className={styles.facts} aria-label="The Lodge at a glance">
            <div><dt>Overnight guests</dt><dd>Up to 8</dd></div>
            <div><dt>Bedrooms</dt><dd>3 bedrooms</dd></div>
            <div><dt>Bathrooms</dt><dd>2 full baths</dd></div>
            <div><dt>Waterfront</dt><dd>Private shoreline</dd></div>
          </dl>

          <nav className={styles.related} aria-label="More about the Lodge">
            <Link href="/lodge">Inside the house ↗</Link>
            <Link href="/grounds">Dock &amp; waterfront ↗</Link>
            <Link href="/photos">Photos ↗</Link>
          </nav>

          <p className={styles.hostNote}>
            <strong>Hosted by Nate &amp; Allie.</strong>
            We own the Lodge and live locally. You can reach us if you have questions about the stay.
          </p>
        </div>

        <section className={"booking-panel booking-panel-direct " + styles.panel} aria-labelledby="booking-form-heading">
          <div className={styles.panelHeading}>
            <p className={styles.panelEyebrow}>{readyToBook ? "Check availability" : "Reservations"}</p>
            <h2 id="booking-form-heading">{readyToBook ? "Choose your nights." : "Booking options."}</h2>
            <p>
              {readyToBook
                ? "Start with check-in and checkout, then tell us who's coming. Your full price and terms come next."
                : "Direct booking isn't available here at the moment. You can still check current dates and pricing on Airbnb."}
            </p>
          </div>

          {status && status !== 'received' && (!enabled || !availabilityReady) && (
            <p className="booking-alert" role="alert">
              {publicError(status)}
            </p>
          )}

          {!bookable ? (
            <div className={styles.fallback}>
              <p className="booking-alert" role="status">
                {enabled
                  ? 'Instant direct booking is being set up. Please use Airbnb to reserve for now.'
                  : 'Direct booking is closed right now. Please use Airbnb to reserve for now.'}
              </p>
              <a className={styles.fallbackButton} href={airbnb} target="_blank" rel="noopener noreferrer">
                Check dates on Airbnb <span aria-hidden="true">↗</span>
              </a>
            </div>
          ) : !availabilityReady ? (
            <div className={styles.fallback}>
              <p className="booking-alert" role="alert">
                We can’t verify the live calendar right now, so direct date requests are temporarily paused.
              </p>
              <a className={styles.fallbackButton} href={airbnb} target="_blank" rel="noopener noreferrer">
                Check dates on Airbnb <span aria-hidden="true">↗</span>
              </a>
            </div>
          ) : (
            <StayRequestForm
              action={requestStay}
              availabilityReady={availabilityReady}
              initialError={status ? publicError(status) : undefined}
              instant={instant}
              today={today}
              unavailableDates={[...unavailable].sort()}
            />
          )}
        </section>
      </section>

      <section className={styles.foot} aria-label="Booking information">
        <p>
          {readyToBook
            ? "Eligible stays are checked against the live calendar. Review your total and the terms before you pay securely through Stripe."
            : "Direct booking is not available right now. The Airbnb listing has its own availability, prices, and checkout terms."}
        </p>
      </section>
      {readyToBook && <BookingSteps instant />}
    </main>
  );
}
