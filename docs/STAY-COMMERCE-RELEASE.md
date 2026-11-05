# STAY Commerce v1 — Kendall Pond Mercantile release record

**Owner:** PublicLogic / KPL. **Date:** 2026-11-05. **Release status:** PREVIEW CANDIDATE, NOT A LIVE RUNTIME RELEASE.

## Linked changes
- PublicLogic/KendallPondLodge PR #57: guest shop, single owner screen, signed webhook routing and guarded checkout.
- PublicLogic/PuddleJumper PR #18: canonical store products, stock movements, scoped orders, checkout holds and audit events.
- The existing direct-booking checkout and live PJ runtime are **not** to be replaced with an unverified image.
- Public-site preview and production are separate; preview must not call a live Stripe key or allow live fallback payment links.

## Boundaries

**Guest**: browse product > choose quantity > PJ validates published product, current price and inventory > PJ makes idempotent reservation > Stripe-hosted Checkout > signed Stripe event > PJ records paid and decrements stock once > guest receipt reads PJ payment state. No guest login and no payment credentials in the browser.

**Owner**: existing Lodge owner code > /owner > /owner/store > add product, set dollars, record +/- stock with reason, publish product, review and fulfill a *paid* order. No local browser inventory copy.

**Governance**: PJ's canonical SQLite product and order projections, its existing one and only append-only Recordstream, property/workspace scope, and a record of shared-owner-code assurance. Shared code is not individual human attribution. Separate PJ user identity/grants are required before claiming individual accountability.

**Payments**: Stripe handles card data; PJ handles pricing, order state and physical inventory. The existing booking webhook adapter remains authoritative for booking metadata. Paid but unrecognized/late/mismatched events must not show a confirmed pickup.

## Environment and recovery gates

- Confirm isolated PJ staging runtime, KPL Preview property key, and test-mode Stripe secret and signed webhook pairing **before** enabling `KPL_STAY_COMMERCE_ENABLED=true` on Preview.
- Leave the feature flag absent/false on Production until verified end-to-end.
- Current Fly app `publiclogic-kpl-store` and volume `kpl_stay_data` are deployed and attached. At inspection, automatic snapshots were enabled, five snapshots existed. **Restore rehearsal not confirmed**; do not mistake snapshots for proof of recovery.
- Record exact PJ image digest, source SHA, Fly machine/volume identity, KPL deployment SHA, rollback image and operator. Never overwrite the general PJ runtime.
- Confirm firewood tax treatment with competent local tax guidance and enable the appropriate Stripe tax collection policy before live sales. Existing manual Stripe Payment Link has automatic tax disabled.
- Confirm physical pickup instructions, inventory count, refund handling, sender identity and owner notifications before placing public QR cards.
- The Live Payment Link exists and is active independently; it is not PJ inventory reconciliation.

## E2E release checklist

- [ ] Backend isolated staging release, exact reviewed image, correct workspace/property binding.
- [ ] Recovery rehearsal passes: snapshot restoration on isolated volume and asset checks.
- [ ] KPL Preview build, owner authentication redirect, guest catalog on phone and desktop.
- [ ] Owner creates $10.00 product, adds 12 bundles, publishes; a second authorized device reads 12.
- [ ] Unknown owner, unauthenticated user, another property's key cannot change stock.
- [ ] Two concurrent carts cannot reserve more than available quantities.
- [ ] Stripe **test-mode** Checkout purchases 2; signed webhook accepted; PJ paid order and stock change from 12 to 10.
- [ ] Signed webhook replay causes no duplicate stock decrement, charge or order.
- [ ] Canceled/expired payment releases stock; late paid event goes to review, not pickup.
- [ ] Order receipt is only confirmed after PJ payment truth; pickup records actor and time.
- [ ] Test refund and stock disposition; payment reconciliation and errors visible to owner.
- [ ] Direct booking and Stripe deposit regression suite passes with the new webhook route.
- [ ] Production Stripe tax, prices, contact sender, owner notices and pickup policy confirmed.
- [ ] Controlled production release and smoke, with rollback reference recorded.

## Suggested verification commands

KPL: Node 24, `npm ci && npm run test:core && npm run build`. Then use the preview branch in an actual browser with authorized test credentials. Test the **new store** through isolated Stripe test keys only.

PJ: `pnpm install --frozen-lockfile && pnpm run ci` and run the existing real-server booking verify script. Record the CI run URL for both repos. Do not equate unit tests or a successful build with verified live payments.

## Rollback and owner safety

- Keep KPL feature flag OFF to disable new PJ checkout and leave direct booking unchanged.
- Unpublish store products if physical stock/pickup is unsafe. Do not edit past audit events.
- Do not auto-restore a production SQLite snapshot without reconciling all post-snapshot paid Stripe orders and reservations.
- A payment/reconciliation failure must leave an explicit owner exception and must not silently re-charge the guest.
