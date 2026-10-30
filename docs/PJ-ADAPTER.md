# PJ booking API adapter

This is the current KPL-facing contract. Historical import revisions remain in [source provenance](SOURCE-PROVENANCE.md). The deployed backend revision and verification status belong in [release verification](NOV1-RELEASE-VERIFICATION.md); this route map does not assert that a particular deployment implements every release change.

Booking routes below are appended to `KPL_STORE_URL`, whose path is `/api/stayos/booking`. Calls use a server-only scoped Bearer key. POSTs also carry `X-PuddleJumper-Request: true`. Responses unwrap `{success:true,data}`. There is no Supabase REST fallback or `apikey` header.

| KPL operation | PJ endpoint | Result |
| --- | --- | --- |
| Create request | POST `/booking-requests` | Booking; compatibility facade wraps it in an array. Optional `request_key` contract below. |
| Private quote lookup | POST `/booking-requests/lookup` with `{quote_token}` | Booking/null; token is not placed in the upstream URL. |
| Owner list | GET `/booking-requests?limit=100` | Scoped booking array. |
| Owner get | GET `/booking-requests/{id}` | Booking/null. |
| Issue quote | POST `/booking-requests/{id}/quote` | `{quote_token}`; compatibility facade returns the scalar. |
| Send quote | POST `/booking-requests/{id}/send-quote` | Actual delivery status and provider-acceptance result. |
| Message status | GET `/booking-requests/message-status` | Readiness and message states; acceptance is not inbox delivery. |
| Begin Checkout | POST `/booking-requests/begin-checkout` with `{quote_token}` | Booking. |
| Attach Checkout | POST `/booking-requests/{id}/attach-checkout` | `{ok}`. |
| Confirm payment | POST `/booking-requests/{id}/confirm-payment` | Structured decision; deliberately unavailable through the old boolean facade. |
| Release unpaid hold | POST `/booking-requests/{id}/release` | `{ok}` after applicable safety checks. |
| Attention | GET `/booking-requests/attention` | Scoped reconciliation/attention data. |
| Record completed correction | POST `/booking-requests/{id}/reconciliation/resolve` with `{note}` | Correction record; no refund or cancellation execution. |

The same client also reads `/api/stayos/content/status` and explicitly registers a calendar at `/api/stayos/content/calendar-source`. Those are content routes, not suffixes under the booking base.

## Initial-request retry contract

`request_key` is an optional UUID in the create-request JSON body. The backend keeps callers that omit it compatible; omission does not provide request-key deduplication.

For a deployed backend implementing this contract:

- The key is scoped to the authenticated workspace/property.
- Repeating the key with the same normalized request payload returns the existing canonical request, without another creation audit entry or another logical request-message set.
- Reusing it with different request data fails with HTTP `409`, `idempotency_conflict`.
- A malformed supplied key fails with HTTP `422`, `invalid_request`.
- Durable lookup/creation occurs transactionally. The key is not a substitute for service authorization or a public lookup credential.

KPL reuses the key for an unchanged submission in the same browser tab. Its browser storage contains the UUID and a SHA-256 payload digest, not the raw guest fields. A changed request gets a new key. The submit control also provides pending feedback; that UI behavior is not the durable deduplication mechanism.

KPL retains fresh calendar and active-stay overlap checks before the service call. A later browser retry may therefore be stopped after an owner hold or confirmation; do not promise successful browser replay across every later lifecycle state. The backend’s matching-key replay behavior and the browser’s preflight behavior are separate contracts.

Older backends may ignore `request_key`. Verify the deployed backend version before claiming protection. No new request-key lookup endpoint is introduced.

## Transport and payment boundaries

`lib/pj-booking-client.mjs` is the dependency-free transport. `lib/booking-db.ts` adds Next’s server-only boundary and booking types. The compatibility facade is a closed map of supported operations, not an arbitrary PostgREST proxy. Errors expose bounded codes, not guest fields, provider bodies or credentials.

`lib/kpl-booking-core.mjs` contains checkout, signature and payment-outcome logic. `lib/booking-stripe.ts` constrains Stripe REST paths to Checkout Session operations. `app/api/stripe/webhook/route.ts` reads bounded raw text before signature verification. Payment confirmation keeps PJ’s structured outcome; unknown or unmatched results must never display a confirmed stay.

Compatible open sessions are reused. A timed-out attachment is ambiguous and is not automatically expired; a definite attachment refusal permits a best-effort expiry of the newly created session. Checkout collects the quoted deposit only.

Quote delivery is an explicit owner action after the complete Airbnb owner block. Confirmation messages are queued after booking truth commits. Mail failure does not reverse that truth.

## Verification boundary

`tests/pj-http-contract.test.mjs` runs a local contract fixture; it is not the real PJ application. Real service/database tests must prove transactional request deduplication and scope isolation. The [human booking proof](HUMAN-BOOKING-PROOF.md) separately exercises the current KPL Preview, deployed test backend, controlled inboxes and actual Stripe hosted test Checkout. Keep each result and remaining limitation in the release record.
