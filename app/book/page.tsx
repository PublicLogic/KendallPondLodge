import type { Metadata } from 'next';

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
          <h1 id="booking-title">Book your stay</h1>
          <p className={styles.lede}>
            {readyToBook
              ? "Choose your dates and guests. You’ll see the total before paying."
              : !enabled
                ? "We're not taking direct bookings right now. Airbnb has the available nights and checkout."
                : !instant
                  ? "We're finishing our direct booking setup. For now, Airbnb has the current calendar and checkout."
                  : "We can't verify the direct calendar right now. You can still check dates on Airbnb."}
          </p>

          <p className={styles.hostNote}>The Lodge at Kendall Pond<br />3 bedrooms · 2 baths · Up to 8 guests<br />Hosted by Nate &amp; Allie</p>
        </div>

        <section className={"booking-panel booking-panel-direct " + styles.panel} aria-labelledby="booking-form-heading">
          <div className={styles.panelHeading}>
            <p className={styles.panelEyebrow}>{readyToBook ? "Check availability" : "Reservations"}</p>
            <h2 id="booking-form-heading">{readyToBook ? "Dates and guests" : "Booking options."}</h2>
            <p>
              {readyToBook
                ? "Select your arrival and departure dates."
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
                  ? 'Direct reservations aren’t open here yet. You can book through Airbnb for now.'
                  : 'Direct reservations are paused. You can book through Airbnb for now.'}
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

    </main>
  );
}
