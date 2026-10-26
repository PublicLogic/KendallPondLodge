import type { Metadata } from 'next';
import Link from 'next/link';

import {
  bookingClient,
  bookingConfigured,
  type Booking,
} from '@/lib/booking-db';

import {
  fetchAirbnbIcs,
  parseIcsEvents,
} from '@/lib/airbnb-ical.mjs';

import { requireKplOwner } from '@/lib/require-kpl-owner';

export const metadata: Metadata = {
  title: 'Availability · KPL',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type AirbnbEvent = {
  start: string;
  end: string;
  summary: string;
};

type CalendarItem = {
  kind:
    | 'airbnb'
    | 'block'
    | 'confirmed'
    | 'hold'
    | 'request'
    | 'conflict';
  label: string;
};

const OWNER_BLOCK_SUMMARY = 'Airbnb (Not available)';

function nyDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
  };
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function normalizeMonth(input?: string) {
  if (input && /^\d{4}-(0[1-9]|1[0-2])$/.test(input)) {
    const [year, month] = input.split('-').map(Number);
    return { year, month };
  }

  const now = nyDateParts();
  return { year: now.year, month: now.month };
}

function shiftMonth(year: number, month: number, offset: number) {
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  };
}

function monthTitle(year: number, month: number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function firstWeekday(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
}

function coversDay(start: string, end: string, day: string) {
  return day >= start && day < end;
}

function overlapsRange(
  start: string,
  end: string,
  rangeStart: string,
  rangeEnd: string,
) {
  return start < rangeEnd && end > rangeStart;
}

function bookingItem(booking: Booking): CalendarItem | null {
  switch (booking.status) {
    case 'confirmed':
      return { kind: 'confirmed', label: 'Direct stay' };

    case 'checkout':
      return { kind: 'hold', label: 'Payment hold' };

    case 'quoted':
      return { kind: 'hold', label: 'Quote hold' };

    case 'requested':
      return { kind: 'request', label: 'Request' };

    default:
      return null;
  }
}

export default async function OwnerAvailability({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await requireKplOwner('/owner/availability');

  const query = await searchParams;
  const selected = normalizeMonth(query.month);

  const previous = shiftMonth(selected.year, selected.month, -1);
  const next = shiftMonth(selected.year, selected.month, 1);

  const today = nyDateParts();
  const todayIso = isoDate(today.year, today.month, today.day);

  const rangeStart = isoDate(selected.year, selected.month, 1);
  const rangeEnd = isoDate(next.year, next.month, 1);

  let airbnbEvents: AirbnbEvent[] = [];
  let airbnbFailed = false;

  try {
    const ics = await fetchAirbnbIcs({ fresh: true });
    airbnbEvents = parseIcsEvents(ics);
  } catch {
    airbnbFailed = true;
  }

  let bookings: Booking[] = [];
  let bookingsFailed = false;

  if (bookingConfigured()) {
    try {
      bookings = (await bookingClient().list(100)) as Booking[];
    } catch {
      bookingsFailed = true;
    }
  } else {
    bookingsFailed = true;
  }

  const activeBookings = bookings.filter((booking) =>
    ['requested', 'quoted', 'checkout', 'confirmed'].includes(booking.status),
  );

  const monthAirbnbEvents = airbnbEvents.filter((event) =>
    overlapsRange(event.start, event.end, rangeStart, rangeEnd),
  );

  const monthBookings = activeBookings.filter((booking) =>
    overlapsRange(
      booking.check_in,
      booking.check_out,
      rangeStart,
      rangeEnd,
    ),
  );

  const airbnbReservations = monthAirbnbEvents.filter(
    (event) => event.summary !== OWNER_BLOCK_SUMMARY,
  );

  const airbnbBlocks = monthAirbnbEvents.filter(
    (event) => event.summary === OWNER_BLOCK_SUMMARY,
  );

  const confirmedCount = monthBookings.filter(
    (booking) => booking.status === 'confirmed',
  ).length;

  const holdCount = monthBookings.filter((booking) =>
    ['quoted', 'checkout'].includes(booking.status),
  ).length;

  const requestCount = monthBookings.filter(
    (booking) => booking.status === 'requested',
  ).length;

  const dayCount = daysInMonth(selected.year, selected.month);
  const leading = firstWeekday(selected.year, selected.month);

  const cells: Array<number | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: dayCount }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  let conflictNights = 0;

  const calendar = cells.map((day) => {
    if (day === null) return null;

    const iso = isoDate(selected.year, selected.month, day);

    const airbnbForDay = monthAirbnbEvents.filter((event) =>
      coversDay(event.start, event.end, iso),
    );

    const bookingsForDay = monthBookings.filter((booking) =>
      coversDay(booking.check_in, booking.check_out, iso),
    );

    const hasAirbnbReservation = airbnbForDay.some(
      (event) => event.summary !== OWNER_BLOCK_SUMMARY,
    );

    const hasDirectHoldOrStay = bookingsForDay.some((booking) =>
      ['quoted', 'checkout', 'confirmed'].includes(booking.status),
    );

    const conflict =
      hasAirbnbReservation && hasDirectHoldOrStay;

    if (conflict) conflictNights += 1;

    const items: CalendarItem[] = [];

    if (conflict) {
      items.push({
        kind: 'conflict',
        label: 'Review conflict',
      });
    }

    for (const event of airbnbForDay) {
      items.push(
        event.summary === OWNER_BLOCK_SUMMARY
          ? { kind: 'block', label: 'Airbnb block' }
          : { kind: 'airbnb', label: 'Airbnb stay' },
      );
    }

    for (const booking of bookingsForDay) {
      const item = bookingItem(booking);
      if (item) items.push(item);
    }

    return {
      day,
      iso,
      items,
    };
  });

  return (
    <main id="main-content" className="owner-availability-page">
      <header className="owner-page-head owner-calendar-head">
        <div>
          <p className="eyebrow">Lodge operations</p>
          <h1>Availability</h1>
          <p className="owner-page-intro">
            Airbnb and direct stays in one operational calendar. Blank dates
            mean no block is currently shown — availability is checked again
            before every quote and payment.
          </p>
        </div>

        <div className="owner-calendar-actions">
          <Link
            className="button button-secondary"
            href={`/owner/availability?month=${monthKey(today.year, today.month)}`}
          >
            Today
          </Link>

          <Link
            className="button button-secondary"
            href={`/owner/availability?month=${monthKey(selected.year, selected.month)}`}
          >
            Refresh
          </Link>
        </div>
      </header>

      {airbnbFailed && (
        <p className="booking-alert owner-calendar-warning" role="alert">
          Airbnb could not be verified. Do not treat blank dates as available.
          PJ records are still shown below.
        </p>
      )}

      {bookingsFailed && (
        <p className="booking-alert owner-calendar-warning" role="alert">
          PJ booking records could not be loaded. Airbnb dates may still be
          shown, but this is not a complete availability view.
        </p>
      )}

      {conflictNights > 0 && (
        <p className="booking-alert owner-calendar-conflict" role="alert">
          {conflictNights} night{conflictNights === 1 ? '' : 's'} this month
          show both an Airbnb reservation and a direct hold or stay. Review
          Bookings before changing any dates.
        </p>
      )}

      <section
        className="owner-calendar-status"
        aria-label="Availability summary"
      >
        <div>
          <span>Airbnb stays</span>
          <strong>{airbnbReservations.length}</strong>
        </div>

        <div>
          <span>Airbnb blocks</span>
          <strong>{airbnbBlocks.length}</strong>
        </div>

        <div>
          <span>Direct confirmed</span>
          <strong>{confirmedCount}</strong>
        </div>

        <div>
          <span>Direct holds</span>
          <strong>{holdCount}</strong>
        </div>

        <div>
          <span>Requests</span>
          <strong>{requestCount}</strong>
        </div>
      </section>

      <section className="owner-calendar-card">
        <div className="owner-calendar-toolbar">
          <Link
            aria-label="Previous month"
            className="owner-month-arrow"
            href={`/owner/availability?month=${monthKey(previous.year, previous.month)}`}
          >
            ←
          </Link>

          <div>
            <p className="eyebrow">Availability calendar</p>
            <h2>{monthTitle(selected.year, selected.month)}</h2>
          </div>

          <Link
            aria-label="Next month"
            className="owner-month-arrow"
            href={`/owner/availability?month=${monthKey(next.year, next.month)}`}
          >
            →
          </Link>
        </div>

        <div className="owner-calendar-legend">
          <span className="owner-legend-airbnb">Airbnb stay</span>
          <span className="owner-legend-block">Airbnb block</span>
          <span className="owner-legend-confirmed">Direct stay</span>
          <span className="owner-legend-hold">Direct hold</span>
          <span className="owner-legend-request">Request</span>
        </div>

        <div className="owner-calendar-weekdays" aria-hidden="true">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div
          className="owner-calendar-grid"
          aria-label={monthTitle(selected.year, selected.month)}
        >
          {calendar.map((cell, index) => {
            if (!cell) {
              return (
                <div
                  className="owner-calendar-empty"
                  key={`empty-${index}`}
                  aria-hidden="true"
                />
              );
            }

            return (
              <div
                className={[
                  'owner-calendar-day',
                  cell.iso === todayIso ? 'is-today' : '',
                  airbnbFailed ? 'is-unverified' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={cell.iso}
              >
                <time dateTime={cell.iso}>{cell.day}</time>

                <div className="owner-calendar-day-items">
                  {cell.items.map((item, itemIndex) => (
                    <span
                      aria-label={item.label}
                      title={item.label}
                      className={`owner-calendar-chip owner-calendar-chip-${item.kind}`}
                      key={`${cell.iso}-${item.kind}-${itemIndex}`}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="owner-calendar-bottom">
        <section className="owner-mini-card">
          <p className="eyebrow">Source rule</p>
          <h3>Airbnb is checked live</h3>
          <p>
            Opening or refreshing Availability bypasses the short calendar
            cache and reads the current Airbnb export.
          </p>
        </section>

        <section className="owner-mini-card">
          <p className="eyebrow">Direct stays</p>
          <h3>PJ remains the record</h3>
          <p>
            Requests, quote holds, payment holds, and confirmed direct stays
            come from PuddleJumper.
          </p>
        </section>

        <section className="owner-mini-card">
          <p className="eyebrow">Actions</p>
          <h3>Bookings changes stays</h3>
          <p>
            Availability is intentionally read-only. Review and act on direct
            requests from the Bookings workspace.
          </p>
          <p>
            <Link href="/owner/bookings">Open Bookings →</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
