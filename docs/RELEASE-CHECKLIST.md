# November 1 direct-booking release checklist

Target: **November 1, 2026**. Record actual results, exact revisions, operator and remaining limits in [release verification](NOV1-RELEASE-VERIFICATION.md). A source merge, successful deployment and completed payment rehearsal are separate milestones.

## Code and deployment

- [ ] Review the combined changes against the current approved site and booking safeguards.
- [ ] Run `npm ci`, `npm run test:core` and `npm run build` on Node 24; record commands and outcomes.
- [ ] Verify phone/desktop rendering, keyboard/focus behavior, calendar states, pending/error feedback and STAY placement in a rendered browser.
- [ ] Identify the deployed KPL and PJ revisions. Confirm that PJ includes durable request-key deduplication; the client field alone is insufficient.
- [ ] Verify the current Preview URL, isolated test workspace/property, scoped key and property provisioning. Do not assume an old alias has the new build.
- [ ] Verify a controlled test calendar with fresh reads and complete owner-block classification.
- [ ] Verify Stripe test key, mode and webhook pairing, plus owner authentication and request throttling.
- [ ] Verify PJ sender authorization/provider connection, public base, owner recipients and intended email identity.

## Complete rehearsal

Run [the full human booking proof](HUMAN-BOOKING-PROOF.md) against the actual reviewed KPL Preview and deployed test backend. Local service tests and an offline payment fixture are supporting evidence.

- [ ] Signed-out initial request and unchanged-request retry produce one canonical request and one logical request-message set.
- [ ] Changed-payload key reuse is rejected; request scope remains isolated. Record deployed-backend proof separately from local tests.
- [ ] Issue an exact itemized quote while dates are free; manually block every night; verify the complete block; explicitly **Send quote**.
- [ ] Verify provider acceptance and actual controlled-inbox receipt for request, quote and confirmation messages.
- [ ] Accept the private quote, complete hosted Stripe test Checkout, and wait for verified confirmation.
- [ ] Verify deposit, balance, reservation/Case linkage, reconciliation and signed-webhook replay with no duplicate records/messages.
- [ ] Exercise calendar failures, partial blocks, Checkout retry, transient confirmation failure, signature/mode rejection and held email.
- [ ] Rehearse unpaid-hold release and separate Airbnb reconciliation. Confirmed stays cannot use unpaid release.
- [ ] Verify that recording a completed correction does not perform a refund or cancellation.

## Owner operations

Complete [the runbook’s decision record](DIRECT-BOOKING-RUNBOOK.md#owner-coverage-and-decision-record) with actual decisions:

- [ ] Approved per-quote deposit, fees/tax treatment, cancellation/refund wording and balance collection process.
- [ ] Named primary/backup coverage for new requests, inboxes, held messages and payment/reconciliation issues.
- [ ] A workable paid-cancellation/refund procedure preserving booking, reservation, payment and accounting evidence.
- [ ] Verified live environment/account/webhook pairing, separate from Preview/test.
- [ ] Rehearsal evidence, unresolved items, release operator and release decision recorded.

## Release and rollback

Publish only the reviewed revisions through the authorized deployment path, then confirm the actual served versions and the public guest pages. Record any backend or environment step that remains blocked rather than treating the website deployment as full transaction readiness.

Retain the prior deployment identity. `KPL_DIRECT_BOOKING_ENABLED=false` stops new public requests once the configuration change is deployed; it is not a complete payment rollback and does not cancel existing quotes, sessions or confirmed stays. Inspect and reconcile existing payment activity before any broader rollback. Keep PJ data and audit history intact.
