# PJ API adapter

Source of truth: `PublicLogic/PuddleJumper`, revision `90042243a1caaec577d1e2882c1bb68d98becdd5`, `docs/stayos-booking-contract.md` and `src/stayos/booking/bookingRoutes.ts`.

All routes below are appended to `KPL_STORE_URL`. All calls use a server-only Bearer key. POSTs also carry `X-PuddleJumper-Request: true`. Responses unwrap `{success:true,data}`. There is no `/rest/v1` request and no `apikey` header.

| KPL operation | PJ endpoint | KPL-facing result |
| --- | --- | --- |
| Create | POST `/booking-requests` | Booking; compatibility facade wraps it in an array |
| Token lookup | POST `/booking-requests/lookup` `{quote_token}` | Booking/null; token never in upstream URL |
| Owner list | GET `/booking-requests?limit=100` | Booking array |
| Owner get | GET `/booking-requests/{id}` | Booking/null; facade wraps it in an array |
| Quote | POST `/booking-requests/{id}/quote` | `{quote_token}` → legacy scalar |
| Begin | POST `/booking-requests/begin-checkout` `{quote_token}` | Booking → legacy array |
| Attach | POST `/booking-requests/{id}/attach-checkout` | `{ok}` → legacy boolean |
| Confirm | POST `/booking-requests/{id}/confirm-payment` | Full structured result; intentionally forbidden through the old boolean facade |
| Release | POST `/booking-requests/{id}/release` | `{ok}` → legacy boolean |
| Attention | GET `/booking-requests/attention` | Scoped attention data |
| Resolve | POST `/booking-requests/{id}/reconciliation/resolve` `{note}` | Correction record only |

`lib/pj-booking-client.mjs` is the dependency-free transport; `lib/booking-db.ts` adds Next's `server-only` boundary and Booking types. The compatibility facade accepts only known operation shapes; it is not an arbitrary PostgREST proxy.

`lib/kpl-booking-core.mjs` contains testable checkout/signature/outcome logic. `lib/booking-stripe.ts` constrains REST paths to Checkout Session operations. `app/api/stripe/webhook/route.ts` reads bounded raw text and invokes that core. There is no Stripe SDK dependency added by this patch.

Unknown outcomes never display a confirmed booking. Existing open sessions are reused. A timed-out attachment is ambiguous and is not automatically expired; a definite attachment refusal causes a best-effort expiry of the new session.

The HTTP test in `tests/pj-http-contract.test.mjs` starts a local **contract fixture**, not the actual PJ application. It proves transport behavior only. The real M5 rehearsal remains separate.
