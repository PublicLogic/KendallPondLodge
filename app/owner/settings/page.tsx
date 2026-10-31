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
import { DirectRateCheck } from './DirectRateCheck';
import { saveInstantBookingPolicy, syncAirbnbCalendar } from './actions';

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
  searchParams: Promise<{ calendar?: string; events?: string; instant?: string }>;
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
  let instantSettings: {
    configured?: boolean;
    enabled?: boolean;
    base_nightly_cents?: number;
    weekend_nightly_cents?: number;
    cleaning_cents?: number;
    pet_fee_cents?: number;
    pet_fee_mode?: 'per_stay' | 'per_pet';
    tax_basis_points?: number;
    taxable_fees?: boolean;
    airbnb_channel_guarded?: boolean;
    deposit_percent?: number;
    min_nights?: number;
    booking_window_days?: number;
    hold_minutes?: number;
    cancellation_terms?: string;
    balance_terms?: string;
  } | null = null;
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
          <StatusItem
            label="Airbnb channel mode"
            value={instantSettings?.airbnb_channel_guarded ? 'Guarded' : 'Verify first'}
            good={instantSettings?.airbnb_channel_guarded === true}
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
              Fresh validation runs again when pricing and when checkout starts.
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
          <h2>Booking guardrails</h2>

          <dl className="owner-rule-list">
            <div>
              <dt>Pricing</dt>
              <dd>Property policy</dd>
            </div>
            <div>
              <dt>Deposit</dt>
              <dd>Policy percentage</dd>
            </div>
            <div>
              <dt>Payment link</dt>
              <dd>1 hour–7 days</dd>
            </div>
            <div>
              <dt>Airbnb</dt>
              <dd>Request-to-Book</dd>
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
          Owner review is for exceptions, not routine bookings. Cleaning is included in the guest stay price; pets are separate. Check the total against Airbnb for comparable dates before claiming a saving.
        </p>
        <div className="owner-instant-grid">
          <div>
            <strong>Airbnb import calendar</strong>
            <p>
              {importCalendarReady
                ? 'Ready to connect in Airbnb. Checkout and confirmed direct stays publish without guest details.'
                : 'Create the private outbound calendar token before connecting Airbnb.'}
            </p>
            {importCalendarReady && <code className="owner-calendar-url">{importCalendarUrl}</code>}
            {importCalendarReady && (
              <ol className="owner-calendar-steps">
                <li>In Airbnb, import this calendar URL for the Lodge listing.</li>
                <li>Turn off Airbnb Instant Book so Airbnb stays require host approval.</li>
                <li>Only then enable instant direct booking below.</li>
              </ol>
            )}
          </div>
          <div>
            <strong>Pricing policy</strong>
            <p>
              {instantSettings?.enabled
                ? 'PJ prices eligible stays automatically. Inventory locks only when the guest starts checkout.'
                : instantSettings
                  ? 'Save the property policy below, then enable instant booking when the terms are ready.'
                  : 'PJ backend update is still required. The current request flow remains safe until it is deployed.'}
            </p>
          </div>
        </div>

        {query.instant === 'saved' && <p className="booking-alert owner-sync-result" role="status">Instant-booking policy saved.</p>}
        {query.instant === 'error' && <p className="booking-alert owner-sync-result" role="alert">Policy not saved. Check every amount and term.</p>}

        {instantSettings && (
          <form action={saveInstantBookingPolicy} className="booking-form owner-instant-policy-form">
            <div className="booking-fields">
              <label>Base nightly <input name="base_nightly" type="number" min="0.01" step="0.01" required defaultValue={instantSettings.configured ? ((instantSettings.base_nightly_cents ?? 0) / 100).toFixed(2) : ''} /></label>
              <label>Fri / Sat nightly <input name="weekend_nightly" type="number" min="0.01" step="0.01" required defaultValue={instantSettings.configured ? ((instantSettings.weekend_nightly_cents ?? 0) / 100).toFixed(2) : ''} /></label>
              <label>Cleaning component · included in stay price <input name="cleaning" type="number" min="0" step="0.01" required defaultValue={instantSettings.configured ? ((instantSettings.cleaning_cents ?? 0) / 100).toFixed(2) : ''} /></label>
              <label>Pet fee <input name="pet_fee" type="number" min="0" step="0.01" required defaultValue={instantSettings.configured ? ((instantSettings.pet_fee_cents ?? 0) / 100).toFixed(2) : ''} /></label>
              <label>Pet fee applies
                <select name="pet_fee_mode" defaultValue={instantSettings.pet_fee_mode ?? 'per_stay'}>
                  <option value="per_stay">Per stay</option>
                  <option value="per_pet">Per pet</option>
                </select>
              </label>
              <label>Tax % <input name="tax_percent" type="number" min="0" max="30" step="0.01" required defaultValue={instantSettings.configured ? ((instantSettings.tax_basis_points ?? 0) / 100).toFixed(2) : ''} /></label>
              <label>Deposit % <input name="deposit_percent" type="number" min="1" max="100" step="1" required defaultValue={instantSettings.deposit_percent ?? ''} /></label>
              <label>Minimum nights <input name="min_nights" type="number" min="1" max="30" step="1" required defaultValue={instantSettings.min_nights ?? ''} /></label>
              <label>Booking window · days <input name="booking_window_days" type="number" min="1" max="730" step="1" required defaultValue={instantSettings.booking_window_days ?? ''} /></label>
              <label>Payment link · minutes <input name="hold_minutes" type="number" min="60" max="10080" step="1" required defaultValue={instantSettings.hold_minutes ?? ''} /></label>
            </div>
            <label className="booking-check"><input type="checkbox" name="taxable_fees" value="yes" defaultChecked={instantSettings.taxable_fees === true} /> Include applicable cleaning and pet fees in the taxable amount</label>
            <label>Cancellation / refund terms<textarea name="cancellation_terms" minLength={20} maxLength={4000} required defaultValue={instantSettings.cancellation_terms ?? ''} /></label>
            <label>Remaining balance terms<textarea name="balance_terms" minLength={20} maxLength={4000} required defaultValue={instantSettings.balance_terms ?? ''} /></label>
            <label className="booking-check">
              <input type="checkbox" name="airbnb_channel_guarded" value="yes" defaultChecked={instantSettings.airbnb_channel_guarded === true} />
              I connected the private KPL calendar to Airbnb and turned off Airbnb Instant Book (Request-to-Book only).
            </label>
            <label className="booking-check"><input type="checkbox" name="enabled" value="yes" defaultChecked={instantSettings.enabled === true} /> Enable instant direct booking with this policy</label>
            <button className="button button-primary" type="submit">Save booking policy</button>
          </form>
        )}
        {instantSettings?.configured && (
          <DirectRateCheck pricing={{
            base_nightly_cents: instantSettings.base_nightly_cents ?? 0,
            weekend_nightly_cents: instantSettings.weekend_nightly_cents ?? 0,
            cleaning_cents: instantSettings.cleaning_cents ?? 0,
            pet_fee_cents: instantSettings.pet_fee_cents ?? 0,
            pet_fee_mode: instantSettings.pet_fee_mode ?? 'per_stay',
            tax_basis_points: instantSettings.tax_basis_points ?? 0,
            taxable_fees: instantSettings.taxable_fees === true,
          }} />
        )}
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
            The guest sees one stay price including cleaning, with pet fees and taxes shown separately. Pricing, deposits, cancellation and balance terms are governed by the property policy.
          </p>
          <p>Changes stay explicit and governed; routine bookings do not need owner repricing.</p>
        </section>

        <section className="owner-mini-card">
          <p className="eyebrow">Owner boundary</p>
          <h3>Access & cancellations</h3>
          <p>
            Owner sessions expire after 12 hours. Guests never need the owner
            code.
          </p>
          <p>
            Unpaid payment links and checkouts may be released here. Paid cancellations and refunds
            remain explicit operator actions.
          </p>
        </section>
      </div>
    </main>
  );
}
