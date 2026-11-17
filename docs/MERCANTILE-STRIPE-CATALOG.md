# Kendall Pond Mercantile — live Stripe Payment Link catalog
**Updated:** 2026-11-17 · **Surface:** `/store` on the existing KPL site · **Scope:** Lodge at Kendall Pond guest-only on-site merchandise.

## Checked live Stripe payment links

These URLs are live Payment Links confirmed in PublicLogic LLC's Stripe account, including two new Puddles offers added November 17, 2026. Every link has `automatic_tax.enabled=true`. The guest website renders the links **only when** `VERCEL_ENV=production` and `KPL_STAY_COMMERCE_ENABLED` is OFF. Preview shows the same merchandise but disables the payment actions.

| SKU | Item | Price | Stripe checkout |
| --- | --- | ---: | --- |
| KPL-WOOD-001 | Firewood bundle | $10.00 | https://pay.publiclogic.org/b/fZudRa4hU6Bv31f9SRgYU03 |
| KPL-PUDDLES-SET-001 | Puddles Coloring Book No. 1 + Kendall Pond Stuffie | $25.00 | https://pay.publiclogic.org/b/3cI3cw8ya6BveJX8ONgYU0f |
| KPL-PUDDLES-001 | Puddles Coloring Book No. 1 | $10.00 | https://pay.publiclogic.org/b/7sY00kaGi1hbbxLe97gYU0e |
| KPL-CRAFT-001 | Kendall Pond Stuffie | $20.00 | https://pay.publiclogic.org/b/7sY14o7u6gc59pD3utgYU0d |
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
- Live Stripe *invoice previews*, not guest charges, returned $1.25 tax on a $20 Kendall Pond Stuffie, $0.63 on a $10 printed Puddles children's coloring book (`txcd_35010001`), and $1.56 on the $25 book-plus-stuffie package (`txcd_99999999`) for a Massachusetts customer address. Both bundle components are taxable physical goods in Massachusetts; the package saves $5 before tax. A $1 snack and $12 hat produced zero Massachusetts tax under their product codes.
- **Open tax verification:** an invoice preview using an out-of-state customer address returned `taxability_reason=not_collecting` on taxable goods. Payment Links may source tax from customer billing address even though every Mercantile item is collected in Gardner. This needs an explicit Massachusetts pickup-tax determination and an accepted checkout implementation before declaring live tax collection correct for out-of-state guests.
- Firewood has been marked nontaxable in the existing Stripe product for personal-use firewood. Verify scope if firewood use or local tax treatment changes.
- No shipping. Products are picked up at the Lodge. No more than 10 units per link checkout. Keep the payment confirmation; any refund/dispute is handled in Stripe, not the PJ order tool.

## Before site merge/release

- [ ] Review and confirm tax sourcing for on-site pickup by visitors with non-Massachusetts billing addresses.
- [ ] Verify physical counts and basket category labels, and define host collection and refund procedures.
- [ ] Run the KPL core suite and production build on the target code revision, and check Vercel preview with checkout disabled.
- [ ] Review the existing PR #57 dependencies and merge readiness; **do not** treat a successful Preview build as production payment/inventory validation.
- [ ] If merchant links are deployed, record exact Vercel deployment and verify live checkout links from a production domain without creating an unintended charge.


## Shop imagery and Puddles offer — November 17, 2026

The Shop stays compact: no oversized entrance, single firewood row, and merchandise cards with useful prices and checkout buttons. Product photos come from actual Lodge sources: the original Puddles coloring book cover in `public/images/kpl/mercantile/puddles-council-of-the-pond-cover.png` and basket crops of the Lodge's own `shelf-overview.avif` for stuffies, hats, slippers, packaged candy and snacks. **Basket photos are representative of the category, not exact SKU photos or stock guarantees.** User-owned images take precedence over external third-party photos that might depict products not carried at the Lodge.

New category: **Puddles & stuffies**. One Puddles and the Council of the Pond Coloring Book No. 1: $10. One Kendall Pond Stuffie: $20 (existing product and link renamed, no duplicate). Book + stuffie: $25, saving $5. New live Stripe Payment Links use automatic Stripe Tax, with a printed children's book code and a tangible-goods bundle code. They are not linked to PJ stock or live purchase events.

The **13** verified links remain behind production-only manual checkout, while governed PuddleJumper commerce remains separately feature-gated. The on-site pickup/guest billing address tax sourcing remains an unresolved release gate; a successful MA-address invoice preview is not proof for other addresses.

The earlier vending-machine prototype, artificial illustrative product images, and generic text-only product panels are retired. Do not simulate a combined cart, ratings, shipping, order confirmation or inventory. Core tests, production build and owner auth smoke must pass on the release revision.
