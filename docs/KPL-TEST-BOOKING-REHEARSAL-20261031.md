# KPL end-to-end test rehearsal — production-like, never live-charge
## Scope
Use a Vercel **preview** created from current main, connected to a **separate PJ staging property/workspace**, a controlled test calendar and **Stripe test mode**. Keep `kendallpondlodge.com`, live payment keys, live inventory and live guest messages untouched.

## Preview isolation configured
On October 31, 2026, the KPL Vercel project received **branch-scoped preview overrides** for `feature/no-payment-inquiries-test-20261031`:
- `KPL_STORE_URL` points to `https://publiclogic-puddlejumper-staging.fly.dev/api/stayos/booking`, not production.
- `KPL_BOOKING_ORIGIN` points to the stable `https://kpl-git-feature-no-payment-inquiries-test-20261031-publiclogic.vercel.app` alias.
- Production environment variables and `kendallpondlodge.com` were not changed.

These overrides do **not** prove the inherited preview scope key belongs to a disposable PJ property, the preview calendar is synthetic, or the registered Stripe **test webhook** targets this branch. Do not attempt a successful paid test until all three are proven.

## Safe setup checks
- Confirm the exact preview deployment and KPL commit.
- Confirm the PJ backend is staging and the bearer key identifies the test property.
- Verify `STRIPE_SECRET_KEY` is test-mode without logging its value and `STRIPE_WEBHOOK_SECRET` matches the preview endpoint.
- Verify `KPL_BOOKING_ORIGIN` and PJ's public booking base are the **same exact preview hostname** (test return URLs cannot be production).
- Use a disposable test calendar; do not use real Airbnb nights as test inventory.
- Use controlled owner and guest inboxes only.
- Stripe test payment can use a small legitimate configured deposit (for example $1.00) **only if the PJ staging pricing policy supports it**. Do not bypass minimums, fabricate an owner block, or modify live pricing.
- When any prerequisite cannot be proven, mark BLOCKED; do not simulate successful checkout or claimed email delivery.

## Three customer paths
1. **Question without dates:** use the new Lodge `/ask` form. KPL submits server-side to the PJ inquiry API; it must return a saved inquiry before the website acknowledges receipt. Confirm one CaseSpace and a truthful host-notification state. If the endpoint is unavailable, show a direct contact fallback instead of pretending it worked.
2. **Dates inquiry without payment:** choose dates and enter contact information, then select `Ask about these dates · no payment`. PJ creates a dedicated inquiry CaseSpace for owner follow-up, without creating a booking request, quote, Stripe checkout, inventory hold or confirmed reservation.
3. **Book:** choose dates, select `See price & book`, review exact amounts and terms, accept them and complete Stripe **test** Checkout. Confirm status only after PJ processes the signed test webhook.

## Pricing and tax policy
- **Stay price includes cleaning.** The public checkout combines lodging, the internal cleaning component, and any weekend adjustment into one displayed stay line. It does not silently change the authoritative PJ total.
- **Pet fees are extra.** If pets are included, their fee appears on a separate line, followed by taxes.
- **Direct should be cheaper than Airbnb all-in** for the same dates, guest count and pets. Owner Settings has a calculator that accepts the actual Airbnb checkout total; it must report a positive saving before any specific savings claim is published. There is no approved live Airbnb rate API in this flow.
- **Massachusetts tax:** Mandatory cleaning, even when included in the room price, is generally part of taxable rent. See https://www.mass.gov/info-details/room-occupancy-excise-tax . Do not reduce or omit tax merely because cleaning is bundled.

## Acceptance checklist
- No-payment dates inquiry yields exactly one PJ inquiry CaseSpace, with no booking request or Stripe session.
- General question without dates creates a scoped inquiry and confirms storage; unreachable PJ reports failure and provides a contact alternative.
- Retry unchanged request idempotently; changed request gets a different identity.
- Payment path shows the full total, cleaning-inclusive stay price, separate pet fees, taxes, deposit and balance, then returns from test Checkout.
- Valid signed webhook confirms once; replay does not duplicate the booking, Case, email or payment.
- Invalid signature/mode, unavailable calendar, abandoned checkout and unavailable messaging fail honestly.
- A normal user cannot access owner-only pages or secret server configuration.
- Screenshots/records contain no guest private details, access tokens, secrets or test-card CVC.
- Test-mode events and messages never appear as real Lodge reservations in production.

## Current block
The connected Stripe app presently exposes a **live-mode PublicLogic account**, not a connected test-mode account. KPL does have existing Preview Stripe test variables and PJ staging work, but their branch-specific scope, current authentication and webhook pairing require verification before authorizing a $1 test payment. A READY preview build is not proof of an E2E transaction. No charge was attempted in this branch.
