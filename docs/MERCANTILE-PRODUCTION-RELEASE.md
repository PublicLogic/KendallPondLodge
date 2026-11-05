# Kendall Pond Mercantile — production gate and rollback
**STAY Commerce v1 · 2026-11-05 · Feature branches only**

## Release target
One minimal mobile guest storefront and one owner surface one navigation level below Direct Bookings. PuddleJumper controls tenant/property scope, governed products, stock adjustments, order state, immutable audit, and fulfillment. Stripe owns payment confirmation. The first offer is $10 firewood bundles, picked up at Kendall Pond. Other products remain drafts or coming soon.

## Source and ordering
1. Runtime PR: https://github.com/PublicLogic/PuddleJumper/pull/18
2. Site PR: https://github.com/PublicLogic/KendallPondLodge/pull/57
3. Release backend first to the **dedicated KPL Fly app**, after a separately verified isolated staging run. Do not deploy this booking subset over the general PJ runtime.
4. Keep `KPL_STAY_COMMERCE_ENABLED` absent/false while provisioning and verifying the runtime.
5. After successful preview E2E, release the site and enable checkout only in the verified environment. Preview must use test Stripe credentials and isolated PJ scope; production must use live Stripe credentials and the intended KPL property scope.

## Completed source-level controls (NOT production proof)
- Property-scoped catalogs and orders; owner requires an existing KPL owner session.
- Stock adjustments with reason and optimistic version; no separate browser-local inventory source.
- Existing PJ canon `audit_events` records product, stock, payment and fulfillment transitions.
- Stripe hosted checkout with server-sourced amounts; signed webhook, livemode check, idempotent settlement, no confirmation by redirect alone.
- Existing lodging booking webhook handler remains separate.
- Firewood fallback payment link is available only in production when PJ checkout is OFF; branch Preview does not route to the live payment link.
- Draft products do not become payable merely by adding them.

## Must pass before merge / production
- [ ] PJ CI: build, typecheck, tests, direct-booking real-server verification, production container restart.
- [ ] Lodge CI: core tests, production build, signed-webhook cases, HTTP guest/owner auth smoke.
- [ ] Verify restored backup and recovery path for `publiclogic-kpl-store`, including any SQLite WAL and canon/audit state. Presence of a snapshot alone is not restoration proof.
- [ ] Preview and production workspace/property keys isolated. Confirm effective Fly volume/config, deploy image digest, rollback image and data migration.
- [ ] Human phone/browser test: guest catalog, quantity, test Stripe hosted Checkout, signed webhook, receipt, owner view, and marked pickup.
- [ ] Retry same Stripe webhook, payment mismatch, duplicate checkout, concurrent orders and stock adjustment, failed/expired checkout and late payment; ensure exactly-once stock movement.
- [ ] Confirm live sales-tax treatment, product scope, refund/returns instructions, pickup location and fulfillment policy with responsible operator.
- [ ] Confirm alerting and owner handling for `needs_review`, failed webhook, refunds and inventory discrepancies.
- [ ] Confirm owner identity limitation: existing shared owner code gives shared-credential assurance, not unique person identity. Upgrade to individual grants when needed.
- [ ] Verify no regression to direct-booking, availability and existing deposit settlement.
- [ ] Record deployment IDs, exact revisions, environment, operator, acceptance evidence and rollback decision.

## Rollback
1. Turn `KPL_STAY_COMMERCE_ENABLED` OFF. This stops new PJ-backed purchases; do not disable booking.
2. Leave the signed webhook consumer capable of reconciling already-created store orders until payment and inventory are resolved. **Do not blindly roll back the database while Stripe can still deliver events.**
3. Revert the Vercel site to the recorded safe deployment, if needed.
4. Restore the previous Fly image only after checking schema compatibility and preserving durable order/audit records; restore from a verified backup only as a deliberate recovery procedure.
5. Reconcile all Stripe sessions created before the stop against PJ orders and manually fulfill/refund exceptions.

## Not a launch claim
GitHub/Vercel `READY` means a build deployed; it does not establish successful payment, correct authorization, durable stock, recovery, live tax or correct pickup. Keep both PRs in draft until all release checks are evidenced.
