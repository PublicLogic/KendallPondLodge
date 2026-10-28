import type { Metadata } from "next";
import Link from "next/link";

import {
  bookingAttention,
  bookingConfigured,
  bookingDb,
  bookingMessageStatus,
  publicError,
  type Booking,
  type BookingAttention,
  type BookingMessageState,
  type BookingMessagingStatus,
  usd,
} from "@/lib/booking-db";

import {
  nightsBetween,
  quoteHasPaymentWindow,
} from "@/lib/booking.mjs";

import {
  airbnbStayStatus,
  fetchAirbnbIcs,
} from "@/lib/airbnb-ical.mjs";

import { requireKplOwner } from "@/lib/require-kpl-owner";

import {
  issueQuote,
  releaseQuote,
  resolvePaymentProblem,
} from "./actions";

import { QuoteLinkActions } from "./QuoteLinkActions";

export const metadata: Metadata = {
  title: "Direct bookings",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

const workflow = [
  "New",
  "Quote",
  "Airbnb",
  "Send",
  "Paying",
  "Confirmed",
] as const;

function quoteSent(
  message: BookingMessageState | null | undefined,
) {
  return (
    message?.status === "sent" &&
    message.provider_accepted === true
  );
}

function statusLabel(
  request: Booking,
  stayStatus: string | null,
  quoteMessage: BookingMessageState | null | undefined,
) {
  if (request.status === "requested") return "New";

  if (request.status === "quoted") {
    if (stayStatus !== "owner-blocked") return "Waiting for Airbnb block";
    return quoteSent(quoteMessage) ? "Sent" : "Quote ready";
  }

  if (request.status === "checkout") return "Paying";
  if (request.status === "confirmed") return "Confirmed";
  if (request.status === "expired") return "Expired";
  return "Declined";
}

function workflowPosition(
  request: Booking,
  stayStatus: string | null,
  quoteMessage: BookingMessageState | null | undefined,
) {
  if (request.status === "confirmed") return 7;
  if (request.status === "checkout") return 5;

  if (request.status === "quoted") {
    if (stayStatus !== "owner-blocked") return 3;
    return quoteSent(quoteMessage) ? 5 : 4;
  }

  if (request.status === "requested") return 1;
  return 1;
}

function WorkflowRail({
  request,
  stayStatus,
  quoteMessage,
}: {
  request: Booking;
  stayStatus: string | null;
  quoteMessage: BookingMessageState | null | undefined;
}) {
  const position = workflowPosition(request, stayStatus, quoteMessage);

  return (
    <div
      className="owner-booking-progress"
      aria-label="Booking progress"
    >
      {workflow.map((step, index) => {
        const number = index + 1;
        const state =
          number < position
            ? "is-done"
            : number === position
              ? "is-current"
              : "";

        return (
          <div
            className={`owner-booking-step ${state}`}
            key={step}
          >
            <span>{number}</span>
            <strong>{step}</strong>
          </div>
        );
      })}
    </div>
  );
}

export default async function OwnerBookings({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
  }>;
}) {
  await requireKplOwner("/owner/bookings");

  const { status } = await searchParams;

  let attention: BookingAttention | null = null;
  let attentionFailed = false;
  let messaging: BookingMessagingStatus | null = null;

  const configured = bookingConfigured();

  let requests: Booking[] = [];
  let failed = false;

  if (configured) {
    try {
      requests = await bookingDb<Booking[]>(
        "kpl_booking_requests?select=*&order=created_at.desc&limit=100",
      );
    } catch {
      failed = true;
    }

    try {
      attention = await bookingAttention();
    } catch {
      attentionFailed = true;
    }

    try {
      messaging = await bookingMessageStatus();
    } catch {
      messaging = null;
    }
  }

  let airbnbIcs: string | null = null;
  let airbnbCheckFailed = false;

  if (
    requests.some((request) =>
      ["requested", "quoted"].includes(
        request.status,
      ),
    )
  ) {
    try {
      airbnbIcs = await fetchAirbnbIcs({
        fresh: true,
      });
    } catch {
      airbnbCheckFailed = true;
    }
  }

  const actionItems =
    attention?.items.filter((item) =>
      item.problems.some(
        (problem) =>
          problem.severity === "action",
      ),
    ) ?? [];

  const counts = {
    new: requests.filter(
      (request) =>
        request.status === "requested",
    ).length,

    quoted: requests.filter(
      (request) =>
        request.status === "quoted",
    ).length,

    paying: requests.filter(
      (request) =>
        request.status === "checkout",
    ).length,

    confirmed: requests.filter(
      (request) =>
        request.status === "confirmed",
    ).length,
  };

  return (
    <main
      id="main-content"
      className="owner-bookings-page"
    >
      <header className="owner-bookings-head">
        <div>
          <p className="eyebrow">
            Direct stays
          </p>

          <h1>Bookings</h1>

          <p>
            One workflow from guest request to
            verified payment.
          </p>
        </div>

        <div className="owner-bookings-head-actions">
          <Link
            className="button button-secondary"
            href="/owner/availability"
          >
            Availability
          </Link>

          <Link
            className="button button-secondary"
            href="/owner/settings"
          >
            Settings
          </Link>
        </div>
      </header>

      <div className="owner-booking-counts" aria-label="Booking status">
        <span><strong>{counts.new}</strong> New</span>
        <span><strong>{counts.quoted}</strong> Held</span>
        <span><strong>{counts.paying}</strong> Paying</span>
        <span><strong>{counts.confirmed}</strong> Confirmed</span>
      </div>

      {status && (
        <p
          role="status"
          className="booking-alert owner-booking-flash"
        >
          {status === "quoted"
            ? "Quote created. Block every quoted night on Airbnb, then refresh."
            : status === "quote-sent"
              ? "Quote email was accepted by the connected provider."
              : status === "quote-held"
                ? "The quote is safe, but email delivery is held. Check PJ messaging readiness or use Copy link."
                : status === "released"
                  ? "Unpaid hold released. Check Stripe and other reservations before changing Airbnb."
                  : status === "resolved"
                    ? "Correction note recorded. This did not issue a refund or cancel the stay."
                    : publicError(status)}
        </p>
      )}

      {!configured && (
        <p className="booking-alert">
          Booking storage is not configured.
        </p>
      )}

      {failed && (
        <p className="booking-alert">
          Booking storage is unavailable.
        </p>
      )}

      {attentionFailed && (
        <p
          className="booking-alert owner-inline-warning"
          role="alert"
        >
          Payment follow-up is temporarily
          unavailable. Check Stripe before
          releasing dates.
        </p>
      )}

      {attention && actionItems.length > 0 && (
        <section className="owner-booking-attention">
          <div className="owner-booking-section-head">
            <div>
              <p className="eyebrow">
                Needs attention
              </p>
              <h2>Payment follow-up</h2>
            </div>

            <strong>
              {actionItems.length}
            </strong>
          </div>

          {actionItems.map((item, index) => {
            const bookingId =
              item.id ??
              item.booking_id ??
              item.booking_request_id;

            const canResolve =
              item.problems.some((problem) =>
                [
                  "refund_required",
                  "payment_rejected",
                ].includes(problem.code),
              );

            return (
              <article
                className="owner-attention-item"
                key={bookingId ?? index}
              >
                <strong>
                  {item.check_in} → {item.check_out}
                </strong>

                {item.problems.map(
                  (problem, problemIndex) => (
                    <p key={problemIndex}>
                      {problem.message}
                    </p>
                  ),
                )}

                <p>
                  Complete the correction in Stripe
                  first. This screen only records
                  what you already did.
                </p>

                {bookingId && canResolve && (
                  <form
                    action={resolvePaymentProblem}
                    className="booking-form"
                  >
                    <input
                      type="hidden"
                      name="id"
                      value={bookingId}
                    />

                    <label>
                      Correction / refund reference
                      <textarea
                        name="note"
                        minLength={3}
                        maxLength={500}
                        required
                      />
                    </label>

                    <label className="booking-check">
                      <input
                        type="checkbox"
                        name="correction_done"
                        value="yes"
                        required
                      />
                      I already completed and checked
                      the correction in Stripe.
                    </label>

                    <button
                      type="submit"
                      className="button button-secondary"
                    >
                      Record correction
                    </button>
                  </form>
                )}
              </article>
            );
          })}
        </section>
      )}

      {!failed &&
        configured &&
        requests.length === 0 && (
          <div className="owner-booking-empty">
            <p className="eyebrow">
              Nothing waiting
            </p>
            <h2>No direct requests yet.</h2>
            <p>
              New guest requests from /book will
              appear here.
            </p>
          </div>
        )}

      <section className="owner-booking-list">
        {requests.map((request) => {
          const stayStatus =
            airbnbIcs &&
            ["requested", "quoted"].includes(
              request.status,
            )
              ? airbnbStayStatus(
                  airbnbIcs,
                  nightsBetween(
                    request.check_in,
                    request.check_out,
                  ),
                )
              : null;

          const quoteOpen =
            request.status === "quoted" &&
            quoteHasPaymentWindow(
              request.quote_expires,
            );

          const total =
            request.total_cents ?? 0;

          const deposit =
            request.deposit_cents ?? 0;

          const balance =
            total - deposit;

          const quotePath =
            `/book/quote/${request.quote_token}`;

          const quoteMessage =
            messaging?.bookings?.[request.id]?.quote_guest ?? null;

          const messagingReady = Boolean(
            messaging?.readiness.enabled &&
            messaging?.readiness.sender_authorized &&
            messaging?.readiness.provider_connected &&
            messaging?.readiness.public_base_configured,
          );

          return (
            <details
              className={`owner-booking-card owner-booking-${request.status}`}
              key={request.id}
            >
              <summary className="owner-booking-card-head">
                <div>
                  <p className="owner-booking-dates">
                    {request.check_in} →{" "}
                    {request.check_out}
                  </p>

                  <h2>{request.guest_name}</h2>

                  <p>
                    {request.guest_email}
                    {" · "}
                    {request.guests} guest
                    {request.guests === 1
                      ? ""
                      : "s"}
                    {" · "}
                    {request.pets} pet
                    {request.pets === 1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <span
                  className={`owner-booking-status status-${request.status}`}
                >
                  {statusLabel(request, stayStatus, quoteMessage)}
                </span>
              </summary>

              <WorkflowRail
                request={request}
                stayStatus={stayStatus}
                quoteMessage={quoteMessage}
              />

              {request.note && (
                <blockquote className="owner-booking-note">
                  {request.note}
                </blockquote>
              )}

              {request.status === "requested" &&
                airbnbCheckFailed && (
                  <p className="booking-alert">
                    Airbnb could not be checked.
                    Refresh before quoting.
                  </p>
                )}

              {request.status === "requested" &&
                !airbnbCheckFailed &&
                stayStatus !== "free" && (
                  <p className="booking-alert">
                    Airbnb already shows these dates
                    blocked. Investigate before
                    quoting.
                  </p>
                )}

              {request.status === "requested" &&
                !airbnbCheckFailed &&
                stayStatus === "free" && (
                  <section className="owner-booking-action-panel">
                    <div className="owner-booking-action-copy">
                      <span>Step 2</span>
                      <h3>Price this stay</h3>
                      <p>
                        Enter the exact quote for this
                        guest. Nothing here becomes a
                        property-wide rate.
                      </p>
                    </div>

                    <form
                      action={issueQuote}
                      className="booking-form owner-quote-form"
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={request.id}
                      />

                      <div className="booking-fields owner-price-grid">
                        <label>
                          Nightly
                          <input
                            name="nightly"
                            type="number"
                            min="0.01"
                            max="999999"
                            step="0.01"
                            required
                          />
                        </label>

                        <label>
                          Cleaning
                          <input
                            name="cleaning"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue="0"
                            required
                          />
                        </label>

                        <label>
                          Pets
                          <input
                            name="pet"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue="0"
                            required
                          />
                        </label>

                        <label>
                          Taxes
                          <input
                            name="tax"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue="0"
                            required
                          />
                        </label>

                        <label>
                          Other
                          <input
                            name="other"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue="0"
                            required
                          />
                        </label>

                        <label>
                          Other fee name
                          <input
                            name="other_label"
                            maxLength={80}
                          />
                        </label>

                        <label>
                          Deposit due now
                          <input
                            name="deposit"
                            type="number"
                            min="0.01"
                            step="0.01"
                            required
                          />
                        </label>
                      </div>

                      <div className="owner-terms-grid">
                        <label>
                          Cancellation / refund terms
                          <textarea
                            name="cancellation_terms"
                            minLength={20}
                            maxLength={2000}
                            required
                            placeholder="Exact cancellation deadline, refund amount and nonrefundable portion."
                          />
                        </label>

                        <label>
                          Remaining balance terms
                          <textarea
                            name="balance_terms"
                            minLength={20}
                            maxLength={1000}
                            required
                            placeholder="When and how the remaining balance will be collected."
                          />
                        </label>
                      </div>

                      <label className="booking-check">
                        <input
                          name="availability_checked"
                          value="yes"
                          type="checkbox"
                          required
                        />
                        I will block every quoted
                        night on Airbnb immediately
                        after creating this quote.
                      </label>

                      <button
                        className="button button-primary"
                        type="submit"
                      >
                        Create quote & hold dates
                      </button>
                    </form>
                  </section>
                )}

              {[
                "quoted",
                "checkout",
                "confirmed",
              ].includes(request.status) && (
                <section className="owner-booking-quoted">
                  <dl className="owner-booking-money">
                    <div>
                      <dt>Total</dt>
                      <dd>{usd(total)}</dd>
                    </div>

                    <div>
                      <dt>Deposit</dt>
                      <dd>{usd(deposit)}</dd>
                    </div>

                    <div>
                      <dt>Balance</dt>
                      <dd>{usd(balance)}</dd>
                    </div>
                  </dl>

                  {request.balance_terms && (
                    <p className="owner-balance-terms">
                      {request.balance_terms}
                    </p>
                  )}

                  {request.refund_reason && (
                    <p className="booking-alert">
                      Payment needs refund review.
                      This is not a confirmed stay.
                    </p>
                  )}

                  {request.reservation_sync_error && (
                    <p className="booking-alert">
                      Payment is recorded, but the
                      stay record needs attention.
                    </p>
                  )}

                  {request.status === "quoted" &&
                    !quoteOpen && (
                      <div className="owner-next-step owner-next-step-warn">
                        <span>Quote expired</span>
                        <strong>
                          Release this hold before
                          changing Airbnb.
                        </strong>
                      </div>
                    )}

                  {request.status === "quoted" &&
                    quoteOpen &&
                    airbnbCheckFailed && (
                      <div className="owner-next-step owner-next-step-warn">
                        <span>Step 3</span>
                        <strong>
                          Airbnb block cannot be
                          verified yet.
                        </strong>
                        <p>
                          Do not send the quote.
                          Refresh once the calendar
                          source is available.
                        </p>
                      </div>
                    )}

                  {request.status === "quoted" &&
                    quoteOpen &&
                    !airbnbCheckFailed &&
                    stayStatus === "conflict" && (
                      <div className="owner-next-step owner-next-step-danger">
                        <span>Conflict</span>
                        <strong>
                          Airbnb shows a reservation
                          or unknown block.
                        </strong>
                        <p>
                          Do not send this quote.
                          Investigate these dates.
                        </p>
                      </div>
                    )}

                  {request.status === "quoted" &&
                    quoteOpen &&
                    !airbnbCheckFailed &&
                    stayStatus !==
                      "owner-blocked" &&
                    stayStatus !==
                      "conflict" && (
                      <div className="owner-next-step">
                        <span>Step 3</span>
                        <strong>
                          Block the stay on Airbnb.
                        </strong>
                        <p>
                          Block every quoted night,
                          wait for the Airbnb calendar
                          to update, then refresh this
                          page.
                        </p>
                      </div>
                    )}

                  {request.status === "quoted" &&
                    quoteOpen &&
                    !airbnbCheckFailed &&
                    stayStatus ===
                      "owner-blocked" && (
                      <div className="owner-next-step owner-next-step-ready">
                        <span>
                          Airbnb block verified
                        </span>

                        <strong>
                          Quote is ready for the guest.
                        </strong>

                        <QuoteLinkActions
                          id={request.id}
                          path={quotePath}
                          deliveryStatus={quoteMessage?.status}
                          providerAccepted={quoteMessage?.provider_accepted}
                          holdReason={quoteMessage?.hold_reason}
                          messagingReady={messagingReady}
                        />
                      </div>
                    )}

                  {request.status === "checkout" && (
                    <div className="owner-next-step owner-next-step-paying">
                      <span>Step 4</span>
                      <strong>
                        Guest opened payment.
                      </strong>
                      <p>
                        Keep the dates blocked until
                        Stripe and PJ resolve this
                        checkout.
                      </p>
                    </div>
                  )}

                  {request.status ===
                    "confirmed" && (
                    <div className="owner-next-step owner-next-step-confirmed">
                      <span>Confirmed</span>
                      <strong>
                        Deposit verified.
                      </strong>
                      <p>
                        PJ owns the confirmed stay
                        record and payment evidence.
                      </p>
                    </div>
                  )}

                  <p className="owner-quote-expiry">
                    Quote expiration:{" "}
                    {request.quote_expires
                      ? `${new Date(
                          request.quote_expires,
                        ).toLocaleString("en-US", {
                          timeZone:
                            "America/New_York",
                        })} ET`
                      : "—"}
                  </p>

                  {request.status !==
                    "confirmed" && (
                    <form
                      action={releaseQuote}
                      className="owner-release-form"
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={request.id}
                      />

                      <button
                        className="button button-secondary"
                        type="submit"
                      >
                        Release unpaid hold
                      </button>
                    </form>
                  )}
                </section>
              )}

              {request.status === "expired" && (
                <div className="owner-next-step owner-next-step-warn">
                  <strong>Expired hold.</strong>
                  <p>
                    Check Stripe and any other
                    reservation before changing the
                    Airbnb block.
                  </p>
                </div>
              )}

              {request.status === "declined" && (
                <div className="owner-next-step">
                  <strong>Request closed.</strong>
                </div>
              )}
            </details>
          );
        })}
      </section>
    </main>
  );
}
