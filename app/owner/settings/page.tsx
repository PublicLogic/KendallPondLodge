import type { Metadata } from 'next';
import {
  bookingClient,
  bookingConfigured,
  directBookingEnabled,
  paymentConfigured,
} from '@/lib/booking-db';
import { requireKplOwner } from '@/lib/require-kpl-owner';
import { airbnbCalendarConfigured } from '@/lib/airbnb-ical.mjs';
import { CalendarSyncControl } from './CalendarSyncControl';
import { syncAirbnbCalendar } from './actions';

export const metadata: Metadata = {
  title: 'Booking setup',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function StatusItem({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="owner-status-item">
      <span className="owner-status-label">{label}</span>
      <strong className={good ? 'owner-status-good' : 'owner-status-warn'}>
        {value}
      </strong>
    </div>
  );
}

export default async function BookingSettings({
  searchParams,
}: {
  searchParams: Promise<{ calendar?: string; events?: string }>;
}) {
  await requireKplOwner('/owner/settings');

  const query = await searchParams;

  let store = 'Not set up';
  let calendar = 'Not set up';

  if (bookingConfigured()) {
    try {
      const status = await bookingClient().contentStatus();
      store = 'Connected';
      calendar = status.calendarConfigured
        ? 'Source registered'
        : 'Not set up';
    } catch {
      store = 'Needs attention';
      calendar = 'Needs attention';
    }
  }

  const localCalendar = airbnbCalendarConfigured();
  const payments = paymentConfigured();
  const directRequests = directBookingEnabled();
  let instantSettings: { enabled?: boolean } | null = null;
  if (bookingConfigured()) {
    try {
      instantSettings = await bookingClient().instantSettings();
    } catch {
      instantSettings = null;
    }
  }
  const importToken = process.env.KPL_AIRBNB_IMPORT_TOKEN?.trim() ?? '';
  const importCalendarReady = importToken.length >= 24;
  const importCalendarUrl = importCalendarReady
    ? `https://kendallpondlodge.com/calendar/${importToken}.ics`
    : '';

  const guestEmail =
    process.env.KPL_BOOKING_CONTACT_EMAIL?.trim() ||
    'info@publiclogic.org';

  return (
    <main id="main-content" className="owner-settings-page">
      <header className="owner-page-head">
        <div>
          <p className="eyebrow">Lodge operations</p>
          <h1>Settings</h1>
          <p className="owner-page-intro">
            Connections, booking rules, and the boundaries that keep direct
            stays governed.
          </p>
        </div>

        <div className="owner-page-context">
          <span>PuddleJumper STAY</span>
          <strong>Lodge at Kendall Pond</strong>
        </div>
      </header>

      <section
        className="owner-status-board"
        aria-labelledby="connection-status-title"
      >
        <div className="owner-status-head">
          <div>
            <p className="eyebrow">System status</p>
            <h2 id="connection-status-title">Booking infrastructure</h2>
          </div>
          <span className="owner-live-mark">Owner view</span>
        </div>

        <div className="owner-status-grid">
          <StatusItem
            label="Booking records"
            value={store}
            good={store === 'Connected'}
          />
          <StatusItem
            label="Airbnb → PJ"
            value={calendar}
            good={calendar === 'Source registered'}
          />
          <StatusItem
            label="Airbnb check"
            value={localCalendar ? 'Source configured' : 'Not set up'}
            good={localCalendar}
          />
          <StatusItem
            label="Payments"
            value={payments ? 'Configured' : 'Needs attention'}
            good={payments}
          />
          <StatusItem
            label="Direct requests"
            value={directRequests ? 'Open' : 'Closed'}
            good={directRequests}
          />
          <StatusItem
            label="Instant booking"
            value={instantSettings?.enabled ? 'Active' : 'Setup required'}
            good={instantSettings?.enabled === true}
          />
          <StatusItem
            label="Airbnb import calendar"
            value={importCalendarReady ? 'Ready' : 'Not set up'}
            good={importCalendarReady}
          />
        </div>
      </section>

      <div className="owner-settings-layout">
        <section className="owner-control-card owner-calendar-card">
          <div className="owner-card-head">
            <div>
              <p className="eyebrow">Availability control</p>
              <h2>Airbnb calendar</h2>
            </div>

            <span
              className={
                calendar === 'Source registered'
                  ? 'owner-pill owner-pill-good'
                  : 'owner-pill owner-pill-warn'
              }
            >
              {calendar}
            </span>
          </div>

          <p className="owner-card-lead">
            Register the private Airbnb calendar with PJ and verify the live
            feed from the deployed server.
          </p>

          {query.calendar === 'registered' && (
            <p className="booking-alert owner-sync-result" role="status">
              Airbnb calendar synced with PJ
              {query.events ? ` · ${query.events} calendar events read` : ''}.
            </p>
          )}

          {query.calendar === 'missing' && (
            <p className="booking-alert owner-sync-result" role="alert">
              Airbnb calendar source is not configured on this deployment.
            </p>
          )}

          {query.calendar === 'unverified' && (
            <p className="booking-alert owner-sync-result" role="alert">
              PJ did not confirm the calendar source after registration.
            </p>
          )}

          {query.calendar === 'error' && (
            <p className="booking-alert owner-sync-result" role="alert">
              Calendar sync failed. No booking or payment was changed.
            </p>
          )}

          <div className="owner-calendar-action">
            <CalendarSyncControl action={syncAirbnbCalendar}>Sync Airbnb calendar</CalendarSyncControl>

            <p>
              Fresh validation runs again when quoting and before checkout.
              Registration alone is never proof that dates are available.
            </p>
          </div>

          <div className="owner-security-note">
            <strong>Private by design.</strong>
            <span>
              Calendar links, connection keys, and payment secrets stay in the
              server runtime and are never displayed here.
            </span>
          </div>
        </section>

        <aside className="owner-control-card owner-rule-card">
          <p className="eyebrow">How booking works</p>
          <h2>Quote rules</h2>

          <dl className="owner-rule-list">
            <div>
              <dt>Pricing</dt>
              <dd>Entered per quote</dd>
            </div>
            <div>
              <dt>Deposit</dt>
              <dd>Exact quoted amount</dd>
            </div>
            <div>
              <dt>Quote life</dt>
              <dd>Up to 48 hours</dd>
            </div>
            <div>
              <dt>Payment start</dt>
              <dd>More than 65 min. remaining</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>Rechecked before payment</dd>
            </div>
          </dl>

          <p className="owner-card-footnote">
            Active PJ booking policy is enforced by PJ and cannot be bypassed
            from this Lodge interface.
          </p>
        </aside>
      </div>

      <section className="owner-control-card owner-instant-booking-card">
        <div className="owner-card-head">
          <div>
            <p className="eyebrow">Instant booking</p>
            <h2>Price once. Book automatically.</h2>
          </div>
          <span className={instantSettings?.enabled ? 'owner-pill owner-pill-good' : 'owner-pill owner-pill-warn'}>
            {instantSettings?.enabled ? 'Active' : 'Policy not active'}
          </span>
        </div>
        <p className="owner-card-lead">
          PJ owns the property pricing policy and applies it automatically to each eligible stay.
          Owner review is for exceptions, not routine bookings.
        </p>
        <div className="owner-instant-grid">
          <div>
            <strong>Airbnb import calendar</strong>
            <p>
              {importCalendarReady
                ? 'Ready to connect in Airbnb. Held, paying, and confirmed direct stays publish without guest details.'
                : 'Create the private outbound calendar token before connecting Airbnb.'}
            </p>
            {importCalendarReady && <code className="owner-calendar-url">{importCalendarUrl}</code>}
          </div>
          <div>
            <strong>Pricing policy</strong>
            <p>
              {instantSettings?.enabled
                ? 'PJ can price and hold eligible stays without an owner quote.'
                : 'PJ backend pricing is not active yet. Requests safely fall back to the current review flow.'}
            </p>
          </div>
        </div>
      </section>

      <div className="owner-settings-secondary">
        <section className="owner-mini-card">
          <p className="eyebrow">Guest identity</p>
          <h3>Communication</h3>
          <p>
            <strong>The Lodge at Kendall Pond</strong>
            <br />
            {guestEmail}
          </p>
          <p>
            PJ governs sender authorization, delivery state, retries, and
            audit. Manual delivery remains the fallback until messaging is
            enabled.
          </p>
        </section>

        <section className="owner-mini-card">
          <p className="eyebrow">Terms</p>
          <h3>Each stay is explicit</h3>
          <p>
            Nightly rate, cleaning, pets, taxes, other fees, cancellation
            terms, balance terms, and deposit are entered on the individual
            quote.
          </p>
          <p>No invented or hidden saved-price defaults.</p>
        </section>

        <section className="owner-mini-card">
          <p className="eyebrow">Owner boundary</p>
          <h3>Access & cancellations</h3>
          <p>
            Owner sessions expire after 12 hours. Guests never need the owner
            code.
          </p>
          <p>
            Unpaid holds may be released here. Paid cancellations and refunds
            remain explicit operator actions.
          </p>
        </section>
      </div>
    </main>
  );
}
