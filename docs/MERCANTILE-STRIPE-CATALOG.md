# Kendall Pond Mercantile — live Stripe Payment Link catalog
**Updated:** 2026-11-17 · **Surface:** `/store` on the existing KPL site · **Scope:** Lodge at Kendall Pond guest-only on-site merchandise.

## Checked live Stripe payment links

These URLs are the *existing* live Payment Links confirmed in PublicLogic LLC's Stripe account, not newly generated application checkouts. Every link has `automatic_tax.enabled=true`. The guest website renders the links **only when** `VERCEL_ENV=production` and `KPL_STAY_COMMERCE_ENABLED` is OFF. Preview shows the same merchandise but disables the payment actions.

| SKU | Item | Price | Stripe checkout |
| --- | --- | ---: | --- |
| KPL-WOOD-001 | Firewood bundle | $10.00 | https://pay.publiclogic.org/b/fZudRa4hU6Bv31f9SRgYU03 |
| KPL-CRAFT-001 | Handmade pond friend | $20.00 | https://pay.publiclogic.org/b/7sY14o7u6gc59pD3utgYU0d |
| KPL-HAT-001 | Handmade hat | $12.00 | https://pay.publiclogic.org/b/dRm8wQ29M3pj9pDaWVgYU04 |
| KPL-MITT-001 | Handmade mittens | $12.00 | https://pay.publiclogic.org/b/8x2aEY5lY2lf7hvghfgYU05 |
| KPL-SET-001 | Hat + mittens set | $20.00 | https://pay.publiclogic.org/b/aFafZiaGie3X0T7aWVgYU06 |
| KPL-SLIP-001 | Handmade slippers | $8.00 | https://pay.publiclogic.org/b/bJe5kEeWy1hb6dr2qpgYU07 |
| KPL-CANDY-001 | Small candy / fruit snacks | $1.00 | https://pay.publiclogic.org/b/dRmfZi9CebVP45jghfgYU08 |
| KPL-COOKIE-001 | Cookies / crackers | $1.25 | https://pay.publiclogic.org/b/8x2bJ2g0Cf81dFT9SRgYU09 |
| KPL-CHIP-001 | Standard chips / Cheetos | $1.50 | https://pay.publiclogic.org/b/aFa7sMbKm2lf1Xbd53gYU0a |
| KPL-CANDY-002 | Full-size candy / sweet snack | $1.75 | https://pay.publiclogic.org/b/5kQ28s7u67Fz9pD2qpgYU0b |
| KPL-SNACK-002 | Larger / premium snack | $2.25 | https://pay.publiclogic.org/b/aFa7sM9Ce3pj9pD8ONgYU0c |

Physical count and availability are **not** verified by this list. Keep customer-facing baskets stocked and make category/size boundaries clear on the physical shelf. Bottled water is complimentary and has no payment link. Items without confirmed prices are not published.

## Two separate paths, one guest storefront

1. **Manual payment-link fallback (currently configured in Stripe):** Stripe collects payment. Guest presents confirmation and picks up a product. Host checks payment in Stripe, fulfills physical pickup, and reconciles quantities. These sales do **not** create PuddleJumper orders or reduce its stock automatically. Code source: `lib/mercantile-payment-links.mjs` and `app/store/page.tsx`.
2. **Governed PJ checkout (not approved for production):** when `KPL_STAY_COMMERCE_ENABLED=true`, use the PJ-backed catalog, stock reservations, signed webhook and status receipts. The public static payment-link fallback is not rendered. This requires the release gates in `MERCANTILE-PRODUCTION-RELEASE.md` and the corresponding PJ runtime PR before launch.

**Never show a paid status in PJ solely because a guest followed a Stripe Payment Link.** Reconcile link sales manually or implement a separately reviewed, idempotent Stripe-to-PJ reconciliation. Never create a parallel browser-local stock source or new database table.

## Tax and pickup controls

- Live Stripe Tax settings have a PublicLogic LLC head office at **110 Kendall Pond Rd W, Gardner, MA 01440** and an active Massachusetts state-sales-tax registration recorded in Stripe.
- A live Stripe *invoice preview*, not a guest charge, confirmed $1.25 tax on one taxable $20 handmade friend at a Massachusetts customer address (`taxability_reason=standard_rated`); a $1 snack and $12 hat produced zero Massachusetts tax under their specific product codes.
- **Open tax verification:** an invoice preview using an out-of-state customer address returned `taxability_reason=not_collecting` on taxable goods. Payment Links may source tax from customer billing address even though every Mercantile item is collected in Gardner. This needs an explicit Massachusetts pickup-tax determination and an accepted checkout implementation before declaring live tax collection correct for out-of-state guests.
- Firewood has been marked nontaxable in the existing Stripe product for personal-use firewood. Verify scope if firewood use or local tax treatment changes.
- No shipping. Products are picked up at the Lodge. No more than 10 units per link checkout. Keep the payment confirmation; any refund/dispute is handled in Stripe, not the PJ order tool.

## Before site merge/release

- [ ] Review and confirm tax sourcing for on-site pickup by visitors with non-Massachusetts billing addresses.
- [ ] Verify physical counts and basket category labels, and define host collection and refund procedures.
- [ ] Run the KPL core suite and production build on the target code revision, and check Vercel preview with checkout disabled.
- [ ] Review the existing PR #57 dependencies and merge readiness; **do not** treat a successful Preview build as production payment/inventory validation.
- [ ] If merchant links are deployed, record exact Vercel deployment and verify live checkout links from a production domain without creating an unintended charge.


## Product-first shop redesign — November 17, 2026

The former illustrated vending-machine prototype has been replaced with a compact, commerce-first **Lodge Shop**. The manual-link path shows a real Lodge welcome-basket photograph, a firewood feature with a real firepit photograph, category tabs for Handmade and Snacks, accurate product names and unit prices, a direct Stripe action on every product, complimentary water, and clearly explained on-site pickup. The shop intentionally does **not** simulate a cart, a vending machine, live stock, product ratings, or checkout confirmation.

The category product surfaces are typographic rather than fabricated SKU photographs. **Outstanding photo requirement:** take and upload actual item photos (especially handmade goods) to complete a best-in-class product catalog; the original shelf overview photo is not a substitute for individual product closeups. Until actual SKU photos exist, don't insert stock photos or AI-generated imitations.

Research and reference audit (Nov. 17, 2026):
- Aesop's live shop: considered hierarchy and restrained visual language, https://www.aesop.com/ .
- Huckberry gifts assortment: curated, fast-to-shop retail products, https://huckberry.com/gifts .
- Graza's live collection: immediate product price/action pairing, https://www.graza.co/collections/olive-oil .
- Baymard, Product Listing Page UX (Aug. 20, 2026): fast comparison, clear filters and scannable attributes, https://baymard.com/blog/product-listing-page-plp-ux .
- Baymard, Product Page UX (Mar. 18, 2026): clear options, accurate imagery and easily located buying action, https://baymard.com/research-articles/current-state-ecommerce-product-page-ux .
- Baymard, Checkout UX (Nov. 3, 2026): low-friction guest checkout and predictable payment steps, https://baymard.com/research-articles/current-state-of-checkout-ux .

The 11 Stripe Payment Links, SKU amounts, tax settings, PJ feature gating, signed settlement, and separate owner dashboard are unchanged. Live Stripe actions remain unavailable in Vercel Preview. The same MA pickup tax-sourcing question remains a production release gate.

Acceptance: code must have clear prices, category filtering, touch-friendly product actions, a visible preview safeguard, honest stock/pickup language, and no simulated dispenser or cart. Core tests, production build and HTTP/owner auth smoke must pass before representing a preview as ready.
