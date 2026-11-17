# Lodge at Kendall Pond — Mercantile Stripe-link store

Updated 2026-11-17. The public `/store` route displays 11 existing live Stripe Payment Links. A protected owner view lives at `/owner/store`. Public, private, and navigation pages share the single `lib/mercantile-payment-links.mjs` catalog. No database or separate store runtime is introduced.

## Inventory / price display

| Group | SKU | Product | Guest price |
| --- | --- | --- | ---: |
| Firewood | KPL-WOOD-001 | Firewood bundle | $10.00 |
| Handmade | KPL-CRAFT-001 | Handmade pond friend | $20.00 |
| Handmade | KPL-HAT-001 | Handmade hat | $12.00 |
| Handmade | KPL-MITT-001 | Handmade mittens | $12.00 |
| Handmade | KPL-SET-001 | Hat and mittens set | $20.00 |
| Handmade | KPL-SLIP-001 | Handmade slippers | $8.00 |
| Snacks | KPL-CANDY-001 | Small candy / fruit snacks | $1.00 |
| Snacks | KPL-COOKIE-001 | Cookies / crackers | $1.25 |
| Snacks | KPL-CHIP-001 | Standard chips / Cheetos | $1.50 |
| Snacks | KPL-CANDY-002 | Full-size candy / sweet snack | $1.75 |
| Snacks | KPL-SNACK-002 | Larger / premium snack | $2.25 |

Bottled water is complimentary. These are individual payment links, *not* a cart. The visitor changes quantity within Stripe. Pickup is on site; no shipping.

## Safety and operational ownership

- Only `VERCEL_ENV=production` renders clickable live Stripe links; Vercel Preview and local development show disabled payment controls.
- The protected `/owner/store` page uses existing `requireKplOwner`; it exposes names, SKUs, prices and a link to Stripe payments. It does **not** represent successful payment, count stock or record handover.
- Payment Link sales are **outside** the PuddleJumper store order ledger. Manually reconcile actual Stripe payments and physical pickups before adjusting stock. Do not treat redirects as paid, invent order records, or assume the guest bought without checking Stripe.
- This is an intentionally narrow live-link storefront to avoid shipping the unfinished STAY Commerce backend. It does not modify or replace the direct-booking flow. PuddleJumper governed commerce remains separately gated in draft PR #57; reconcile overlapping `/store` code before merging that PR.
- Stripe Tax settings were configured for PublicLogic LLC with an active Massachusetts state registration and all 11 links set to automatic tax. Live invoice preview for $20 handmade friend at MA buyer address: $1.25 tax. Candy and a $12 hat: $0 MA tax in preview.
- **Tax sourcing remains to be verified** for on-site pickup by a guest using an out-of-state billing address. A prior Stripe invoice preview in NY returned `taxability_reason=not_collecting` for a taxable item. Do not treat active Stripe Tax as proof all physically picked-up Massachusetts sales are taxed correctly. Confirm the sourcing approach before merging into a live checkout.
- Physical stock, refund process and marked basket category labels must be confirmed by the hosts before public QR labels go on display.

## Checks before merge/deploy

1. `npm run test:core && npm run build` on PR head.
2. Check `/store` in Vercel Preview: 11 products, three groups, no clickable live payment buttons.
3. Confirm owner access gate at `/owner/store`; unauthenticated visitor must not see owner view.
4. Resolve tax sourcing, physical stock, and any remaining refund/pickup issues.
5. After merge, validate live products and checkout destinations on production without making an unnecessary charge; capture the deployment SHA.

Rollback is a Vercel deployment revert or removing the navigation link. The underlying Stripe Payment Links are independent and must be managed separately in Stripe.
