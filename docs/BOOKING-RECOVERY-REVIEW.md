# Booking recovery review — November 27, 2026

Baseline: `main` at `ff09f6b697b25b01a171a75a35b8cc3cebe3989e`, the already released #73 tree. The interrupted agent's booking edits were preserved and extended, not reset. No live setting, reservation or payment was read or changed during functional testing.

## Existing contract, not a new policy

`7ff48a50af300f71426ad9530f5c16709bc16857` ("Accept longer KPL payment-link windows") widened the owner action to whole minutes from **60 through 10,080 inclusive**. The owner input already advertised that same range, and the saved PJ booking-service source validates and persists it. The later local occupancy-pricing adapter accidentally retained the older 90–360 validator.

The shared payment-window validator now makes automatic quotes agree with the existing owner UI/action. Saved 60, 90, 360, 480 and 10,080 values work unchanged; there is no migration, coercion, clamping, selected default or settings write. Invalid 59, 10,081, fractional, null and string settings cannot issue quotes. Offline tests exercise the actual owner save action with 60, 480 and 10,080, then reuse its serialized policy in automatic pricing; invalid boundaries produce no settings write.

`hold_minutes` sets the quote deadline. It does not change the existing Stripe checkout duration: `beginGuestCheckout` continues to derive that session's one-hour expiry from the persisted checkout-start time and use its existing idempotency key. The saved PJ source only lazily expires deadline-passed quoted records without a Stripe session. A delayed webhook is not proof that a checkout failed.

No genuine duration-policy decision remains for this compatibility correction. Any future change to business defaults or the separately established checkout lifetime needs its own owner decision.

## Guest-visible recovery

- An unresolved checkout or recorded payment remains in the checking state after the quote deadline; guests are told not to pay again and are not offered a new dates link or payment form.
- Authoritative expired and declined records remain distinct. Declined requests render a cancellation notice and host contact instead of disappearing as a 404.
- Refund review and reservation-sync attention never become redirect-only success. An open cancelled Stripe redirect still offers the existing resume-payment path; it does not cancel the reservation request.
- Unpaid quotes still expire at the actual timestamp and may choose new dates. Tests cover one millisecond before, exactly at and one millisecond after the deadline.

## Evidence

- Node 24.22.3 and the existing QA installation were reused. **242 core tests pass**, including actual server-action and rendered-page fixture coverage. Production build passes.
- Booking guest-count pricing passes at 320, 390, 768 and 1280 pixels with synthetic November dates and counts 2, 3 and 8, plus invalid counts. No request form is submitted.
- Seven payment-state fixtures pass at both 390 and 1280 pixels, including delayed checkout, cancellation, expiration, refund review, reservation attention, confirmation and paused checkout. No Stripe, email or reservation-provider traffic is allowed.
- Live and local waterfront homepages pass at 390 and 1440 pixels: three photo choices work, images load, no horizontal overflow or page errors, and axe WCAG A/AA reports no violations. The phone/desktop screenshots were visually reviewed.
- Changed executable-source lint passes. Including `lib/kpl-booking-core.d.mts` exposes four pre-existing `no-explicit-any` errors, reproduced from current main's original declaration; those unrelated types are not rewritten here.

The saved agent's earlier build failed because the new cancellation state was missing from the declaration union; that inherited declaration fix is retained. An initial sandboxed core run could not bind its local HTTP fixture server (`EPERM`), and its build stalled; both pass when rerun with the required local process permissions. These are recorded separately from product failures.

This branch contains no CI workflow changes. Review and production merges/deployments remain separate actions requiring Nate's approval.
