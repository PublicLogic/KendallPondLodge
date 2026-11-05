# Kendall Pond Mercantile — branch mockup
Date: 2026-11-05
Branch: `feat/kendall-pond-mercantile-mockup`

## Purpose
A safe, responsive visual and interaction prototype based on the Pine Ledge Farm business plan and financial model. It is **not a live store**.

## Routes
- `/store`: guest-facing browse, quantity controls, basket, and disabled checkout. Public but noindexed.
- `/owner/store`: existing owner-code-protected dashboard showing illustrative stock and sourcing. No editing or write endpoints.

## Current data and hosting
- Public UI: existing KPL Next.js project on Vercel (`kendallpondlodge.com`).
- Mock catalog: `lib/mercantile-demo.ts`, committed fixture only. **Not actual stock or an offer.**
- Proposed durable source of truth: property/workspace-scoped PuddleJumper StayOS tables in existing Fly.io `publiclogic-kpl-store` SQLite storage. No schema or deployment changes in this branch.
- Proposed checkout: separate Stripe Checkout Sessions with `metadata.store_order_id`, verified webhook signature, idempotent payment settlement. **Do not route store purchases through booking deposit settlement.**
- Future physical operation: shelf QR → product page → payment → verified pickup instructions. No payment or inventory decrement in mock.
- Pilot: $135 opening cash, mostly consignment; track attach rate per completed stay, item mix, conversion, shrinkage, margins, and supplier payables.
- Food products are shown as unavailable pending local approval and supplier verification.

## Next implementation slice (not part of mock)
1. Snapshot and verify restoration of Fly volume before migrations. Current Fly volume reports automatic backups disabled.
2. Add store tables `stayos_store_products`, `stayos_store_stock_movements`, `stayos_store_suppliers`, `stayos_store_orders`, `stayos_store_order_lines`, `stayos_store_payment_events`, scoped by workspace and property.
3. Build scoped server-to-server `/api/stayos/store` routes, using the existing bearer-key authorization pattern. Keep public reads narrow; do not expose costs, supplier details, or guests.
4. Build KPL server-only adapter; add owner product/stock/fulfillment actions and transactionally reserve/decrement inventory.
5. Build store-specific Stripe Checkout and webhook settlement. Verify price server-side and prevent duplicate order/stock changes on webhook replay.
6. Test with Stripe test mode, both phone and desktop, duplicate submits, stale stock, out-of-stock, payment failure, canceled checkout, signed webhook replay, and booking checkout regression.
7. Release only after confirming pickup instructions, tax configuration, supplier permissions, food compliance and live backups.

## Test locally
```sh
npm ci
npm run test:core
npm run build
npm run dev
```
Open `/store` and `/owner/store`. Existing owner code is required for the latter. A successful build is not proof of payment readiness.

## Deliberately out of scope
No live products, QR deployment, checkout, database migration, fulfillment automation, supplier settlement, navigation changes, or production release. No writes to main.
