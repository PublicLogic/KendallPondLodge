# Governed Mercantile checkout retry correction

Reviewed November 17, 2026. Base: PublicLogic/KendallPondLodge PR 57, `5a0fc78535cd71c5d4aa02294c0157eb259b9724`. Production unchanged.

The old action used `stay-mercantile-<order-id>` as its Stripe idempotency key but computed `expires_at` from each attempt’s current wall clock. A retry therefore changed parameters under the same key, and an already attached session was not retrieved.

The server action now delegates to a testable coordinator. New-session expiry comes from the canonical order’s persisted creation time, within its hold; existing sessions are retrieved and reused. Already paid PJ orders and completed Stripe sessions return to the PJ-backed receipt without asserting a new payment. Invalid/mismatched mode, unsafe checkout URL, closed order and unverified attachment fail. Ambiguous attachment errors do not expire a possibly valid session or report success.

Validation: `node --test tests/mercantile-checkout.test.mjs tests/mercantile-webhook.test.mjs` — 12 pass. Tests include a lost attachment response and byte-identical Stripe retry parameters, reuse, payment-state receipt behavior, expiration, mode and redirect boundaries. No Stripe request, live charge, external message or production setting was changed. Full KPL build and hosted CI remain required; the local checkout was a source subset.

This branch targets the existing governed-shop branch so it preserves that preview’s design and history. It does not resolve PR 57’s main-branch conflicts or enable `KPL_STAY_COMMERCE_ENABLED`. Pair with PJ’s release candidate (late-hold settlement correction and combined migrations), run isolated provider test Checkout, and retain the tax/pickup/refund and target-volume recovery gates already documented for the shop. Manual Payment Links remain outside PJ inventory.
