# Mercantile recovery review — November 27, 2026

## Released versus unique work

Reviewed against `main` at `ff09f6b697b25b01a171a75a35b8cc3cebe3989e` and the public `/store`.

| Draft | Exact reviewed head | Already shipped | Unique work retained |
| --- | --- | --- | --- |
| #57 | `625ff6180b230e11bf6fa0bee95ff4a33f673488` | All 13 SKU/price/Payment Link tuples and all ten studio assets/mappings match main. The released store has a newer Shelf Shop presentation. | Governed PJ products, stock adjustments, orders, fulfillment, receipt, signed webhook and runtime adapter are not in the released manual-link shop. Keep the original draft and branch. |
| #62 | `fd38d497dcd9d8ef8c9fbb45a5bc766fd0600f9d` | Its 11 SKU/price/link tuples are in the current 13-item catalog. | Its owner/payment-review surface is not an exact ancestor of main. Keep the original draft; do not merge the old storefront over the released one. |
| #63 | `ca261bfe72682634c335ea0a9701bf7fdb814232` | Not the released checkout path. | Stable governed checkout coordination and regressions, preserved here as an unwired helper. Keep the original draft and its backend/receipt/webhook context. |

The old #57 owner component uses `orders.slice(0,12)` with no pagination or status filter: a paid order at position 25 is inaccessible there. Its earlier checkout action recalculates expiry from the wall clock despite using an order-based Stripe key and does not retrieve attached sessions. #63 corrects that retry problem. The released store uses Payment Links, not those PJ actions; no governed retry behavior is claimed live.

## Focused preservation candidate

- Retains the interrupted agent's read-only owner-order preview and adds its missing TypeScript declaration. Authenticated owners can follow rendered pagination or filter paid orders beyond the first twelve. PJ's newest-100 response remains an explicit limit, not a complete historical ledger.
- The preview requires both `VERCEL_ENV=preview` and `KPL_STAY_COMMERCE_ENABLED=true`; production cannot initialize the reader through this route. Configure an isolated PJ backend explicitly before any hosted review. No environment settings are changed by this PR.
- Retains the #63 checkout coordinator and retry regressions, but deliberately does **not** connect it to the released storefront. Lost attachment/response retries preserve every Stripe parameter and idempotency key; attached sessions are retrieved; closed/wrong-mode/mismatched sessions fail closed. Paid/completed paths lead to a receipt, not redirect-based confirmation.
- Does not add product, price, stock, collection or fulfillment mutations. Does not replace public store markup, catalog, images, Payment Links, payment webhook or the guest pickup workflow. The original drafts retain those larger unique behaviors for separately approved reconciliation.

## Verification and limits

Node 24.22.3, existing installed dependencies and local Playwright/axe were reused. The inherited work initially passed 233 core tests but failed TypeScript on the string page parameter and an implicit-any order; the declaration fixes both without changing pagination behavior. The final candidate adds catalog/price/link, imagery, storefront-mode, actual route-auth and production-pause regressions. See the PR review comment for final counts and exact published head.

Fixture-only browser testing follows Next links from page 1 through page 3 to synthetic paid order 25, then filters paid orders back to page 1. Unauthenticated owner access redirects to sign-in; the authenticated preview has no mutation forms. The first browser attempt checked the DOM before client navigation completed; the QA harness now waits for each page URL and order, with no app change required.

Public GET-only comparison confirms 13 released Payment Links match this catalog. No payment URL is visited. Local preview checkout remains disabled. Booking, charges, email and real guest/owner-order records are excluded from test data. No production merge, deployment, commerce enablement, provider acceptance, tax decision or inventory reconciliation is implied.
