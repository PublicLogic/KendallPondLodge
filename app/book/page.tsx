import Image from 'next/image';
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
import { StayRequestForm, StayRequestReceipt } from './StayRequestForm';

export const metadata: Metadata = {
  title: 'Request a stay',
  alternates: { canonical: '/book' },
  description:
    'Choose your dates and request a direct stay at the Lodge at Kendall Pond.',
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

  return (
    <main
      id="main-content"
      className="booking-page booking-page-direct"
    >
      <section className="booking-above-fold">
        <div className="booking-intro">
          <div className="booking-intro-copy">
            <p className="eyebrow">Direct with Nate & Allie</p>

            <h1>{bookable ? "A stay worth slowing down for." : "Check available dates."}</h1>

            <p>
              {bookable
                ? "Coffee on the deck. A long soak in the hot tub. Choose your dates to see the complete direct price and book securely."
                : enabled
                  ? "Instant direct booking is being set up. For now, check current availability and book through Airbnb."
                  : "Direct booking is closed for now. You can check dates and book through Airbnb."}
            </p>

            <div className="booking-intro-facts">
              <span>8 guests</span>
              <span>3 bedrooms</span>
              <span>2 baths</span>
              <span>Private shoreline</span>
            </div>

            <p className="booking-intro-links">
              <Link href="/lodge">See inside</Link>
              <Link href="/grounds">Waterfront</Link>

              <a
                href={airbnb}
                rel="noreferrer"
                target="_blank"
              >
                Airbnb ↗
              </a>
            </p>
          </div>

          <figure className="booking-intro-photo">
            <Image
              alt="Cushioned upper-deck seating overlooking Kendall Pond"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 42vw"
              src="/images/kpl/2026-10-28/kendall-pond-lodge-deck-lounge-autumn.webp"
            />
          </figure>
        </div>

        <div className="booking-panel booking-panel-direct">
          <h2>Your stay.</h2>

          {status && status !== 'received' && (!enabled || !availabilityReady) && (
            <p className="booking-alert" role="alert">
              {publicError(status)}
            </p>
          )}

          {!bookable ? (
            <p className="booking-alert">
              {enabled ? 'Instant direct booking is being set up. ' : 'Direct booking is closed right now. '}
              <a href={airbnb}>Book on Airbnb instead.</a>
            </p>
          ) : !availabilityReady ? (
            <div>
              <p className="booking-alert" role="alert">
                We can’t verify the live calendar right now, so
                direct date requests are temporarily paused.
              </p>

              <p className="booking-guest-link">
                <a
                  href={airbnb}
                  rel="noreferrer"
                  target="_blank"
                >
                  Check live availability on Airbnb ↗
                </a>
              </p>
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
        </div>
      </section>

      <section className="booking-direct-foot">
        <p>
          {bookable
            ? "Eligible dates are priced and held automatically while you review the complete price and terms. Payment is handled securely through Stripe."
            : "Instant direct booking is paused; visit Airbnb for current availability."}
        </p>
      </section>
      {bookable && <BookingSteps instant />}
    </main>
  );
}
