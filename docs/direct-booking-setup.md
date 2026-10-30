# Direct-booking setup

KPL is the Next.js app hosted by Vercel project `kpl`. It connects to a separately deployed PJ booking service. This document describes configuration and operation, not proof that a particular environment is ready. Keep actual revisions and results in [release verification](NOV1-RELEASE-VERIFICATION.md); retain historical source details in [source provenance](SOURCE-PROVENANCE.md).

Use Node 24 and the included npm lockfile. Run `npm ci`, `npm run test:core` and `npm run build`. Installation/build does not provision the booking property or establish a successful payment rehearsal.

## KPL server configuration

| Variable | Meaning |
| --- | --- |
| `KPL_STORE_URL` | Full booking base, `https://<pj-origin>/api/stayos/booking`. HTTPS is required outside explicitly allowed local development. |
| `KPL_STORE_KEY` | Opaque service key bound to the intended workspace/property. Keep it server-side. |
| `KPL_BOOKING_ORIGIN` | Exact trusted HTTPS origin for Stripe return links. Use the current Preview origin for rehearsal and the public Lodge origin for production. |
| `KPL_DIRECT_BOOKING_ENABLED` | Exact `true` opens requests once service configuration is valid. It does not prove calendar, payment or messaging readiness. |
| `KPL_AIRBNB_ICAL_URL` | Private export for fresh owner checks and explicit registration with PJ. Never expose or log it. |
| `STRIPE_SECRET_KEY` | Key for the intended Stripe account/mode. Rehearsal requires a verified test key. |
| `STRIPE_WEBHOOK_SECRET` | Matching secret for this environment’s `/api/stripe/webhook` endpoint. |
| `KPL_BOOKING_CONTACT_EMAIL` | Public guest contact address. It does not configure an outbound email provider. |
| `KPL_OWNER_CODE_HASH` | SHA-256 hash of the owner’s strong passphrase. |
| `KPL_OWNER_SESSION_TOKEN` | HMAC signing secret of at least 32 characters; the raw value is never the browser cookie. |
| `KPL_GUIDEBOOK_CODE_HASH`, `KPL_GUIDEBOOK_SESSION_TOKEN` | Separate protected Guidebook configuration. |

The current webhook derives test/live mode from `STRIPE_SECRET_KEY` and checks the Stripe event and session against it. A legacy `KPL_STRIPE_WEBHOOK_MODE` value does not control this implementation. Verify the actual test key, endpoint and hosted Checkout before rehearsal.

Do not use `NEXT_PUBLIC_` variables for booking secrets or commit environment files. Keep Preview/test keys, calendars, property records and recipients separate from live operations.

## PJ deployment and messaging

Verify the deployed backend revision, migrations, workspace, property and key scope. The property must exist for reservation/Case creation. A valid service key alone does not prove this. Deploy the backend request-key implementation before claiming durable initial-request deduplication; older services may accept the field without applying its guarantee.

The messaging contract is:

| Event | Delivery behavior |
| --- | --- |
| Guest request committed | PJ queues guest acknowledgement and owner notification. |
| Owner issues quote | Quote is recorded; this is not the send action. |
| Owner clicks **Send quote** | PJ attempts delivery only after every stayed night is verified owner-blocked. |
| Verified payment confirms booking | PJ queues guest and owner confirmations after committing booking truth. |

PJ requires `PJ_STAY_MESSAGING=enabled`, `KPL_BOOKING_PUBLIC_BASE_URL` set to the exact guest-site origin, and `KPL_BOOKING_OWNER_EMAILS` containing authorized owner recipients. It also needs an authorized workspace email sender and connected Google or Microsoft provider.

`PJ_STAY_EMAIL_IDENTITIES` is optional workspace-scoped From/Reply-To presentation. If configured, the connected provider must permit that identity. The public base setting is `KPL_BOOKING_PUBLIC_BASE_URL`; do not use the obsolete `KPL_QUOTE_LINK_BASES` setting.

Missing readiness or provider errors leave a truthful held/failed result. Inspect Owner → Bookings messaging status. `sent`/provider acceptance does not prove inbox delivery. A mail problem never changes an already committed payment result.

## Calendar registration and preflight

After privately loading the intended environment:

```sh
# Read-only configuration and connection checks:
node --env-file=.env.local scripts/pj-preflight.mjs

# Deliberate write, only after verifying the key’s workspace/property:
node --env-file=.env.local scripts/pj-calendar-source.mjs --apply
```

The preflight does not prove property provisioning, fresh availability, Stripe account/webhook pairing, delivered email or a completed Checkout. Calendar registration is not a successful availability read. Verify both the KPL and PJ calendar checks using the controlled rehearsal calendar.

## Quote and payment sequence

Issue the quote while the entire stay is free. Enter exact whole-cent nightly/cleaning/pet/tax/other/deposit amounts; label any other fee and provide complete cancellation and balance terms. KPL computes the total. It does not adopt a deposit percentage, tax rate or cancellation policy.

The current expiry cap is `min(now + 48 hours, check-in date at 00:00 UTC)`, with more than 65 minutes required to begin payment. Use the displayed expiry in operation; it is not an editable pricing default.

After issue, manually block every stayed night on Airbnb. Wait for a fresh read to show the complete `owner-blocked` interval, then explicitly **Send quote**. Checkout rechecks the hold. Missing/unreadable calendars fail closed.

Checkout charges the exact quoted deposit in USD. The remaining balance is not collected by this Checkout. Existing compatible open sessions are reused; the payment window and Stripe idempotency key remain anchored to the first checkout attempt.

## Payment outcomes and owner corrections

KPL verifies the bounded raw webhook body, signature, mode and paid-session data before reporting the payment to PJ. It does not take an amount from the browser.

- A confirmed PJ decision establishes the booking result; a return redirect does not.
- Durable rejection/refund-required outcomes are acknowledged to Stripe and surfaced for owner reconciliation.
- An unmatched-scope outcome requires investigation and must not be described as a confirmed booking or an established reconciliation record in the wrong scope.
- Transient network/upstream failures return a retryable response so a later Stripe delivery can settle the result.

Release applies only to unpaid holds, after checking/expiring an existing Stripe session. Reconcile the separate Airbnb block afterward. Paid cancellations, refunds and later balance collection remain owner operations. **Record correction** only records work already performed.

See the [owner runbook](DIRECT-BOOKING-RUNBOOK.md) and [human booking proof](HUMAN-BOOKING-PROOF.md) for operating decisions and actual acceptance evidence.

## Owner access and scope

Owner access remains the code-based gate. The signed session is randomized, HttpOnly, SameSite=Lax, Secure in production and expires after 12 hours. Changing the signing secret or code hash invalidates old sessions. Logout clears the browser cookie.

This shared-owner gate does not provide per-person attribution or a server-side per-session revocation registry. Verify host-level request throttling and use the existing authorized owner access process; do not introduce a testing bypass.
