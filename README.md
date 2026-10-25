# Kendall Pond Lodge — PJ booking adapter

**This is the actual KPL Next.js site, not the earlier HTML design preview.** Guest booking stays on KPL. Customers need no PJ account, no Google login, no subscription and no owner code.

The flow remains **public request → host's itemized private quote → Stripe deposit → verified PJ booking record**. It is not instant booking: this release preserves the established per-quote pricing and manual Airbnb block.

## Destination

Put this source in the **KPL repository**, `PublicLogic/KendallPondLodge`, not inside the shared PJ app. That repository was empty when inspected. The current hosting project is **Vercel / kpl**, with `kendallpondlodge.com` assigned to it. The Cloudflare/Sites files inherited from the source snapshot are not the active deployment instructions.

The integration targets `PublicLogic/PuddleJumper` at commit `90042243a1caaec577d1e2882c1bb68d98becdd5`, through `/api/stayos/booking`. No PJ code changes are required by this package. An available PJ deployment, matching scoped key, property provisioning and calendar registration are still required.

## What changed

- Replaced Supabase REST/RPC transport with the exact PJ booking endpoint map, preserving the existing KPL call-site shapes.
- Kept `/book`, `/book/quote/<token>` and `/owner/bookings`; kept owner-code login rather than introducing a Google migration.
- Acknowledged PJ's durably reported payment rejections/refund requirements; retry transient errors. A return from Stripe never confirms a stay.
- Added owner payment-attention records and an explicit **record completed correction** action. This does not issue refunds or cancel stays.
- Kept exact per-quote deposit amounts, every fee, cancellation/balance terms, and the 48-hour quote cap. No browser-saved pricing defaults.
- Added read-only `/owner/settings`, clear calendar-unavailable states, approved STAY/PJ artwork, and booking-specific typography/focus improvements. No cleaner module.
- Replaced the raw owner-secret cookie with a randomized, HMAC-signed, 12-hour session. Existing owner cookies must sign in again. The same environment-variable names are retained.

## Inspect the downloaded package

`node scripts/verify-package.mjs` checks the bundled hashes without installing dependencies or making network calls. The hashes detect changed bytes; they are not an independent publisher signature. Review the source before running it.

## Run / verify

Use Node 24 (`.nvmrc`) and npm. No install script deploys, provisions, sends messages, or enables live booking.

```sh
npm ci
npm run test:core
npm run build
npm run dev
```

Copy `.env.example` to `.env.local` privately, then fill the existing environment values. Next reads `.env.local`; the standalone setup scripts need it loaded explicitly:

```sh
node --env-file=.env.local scripts/pj-preflight.mjs
# Explicit one-time calendar registration, only after verifying the key's property:
node --env-file=.env.local scripts/pj-calendar-source.mjs --apply
```

The preflight is read-only. Calendar registration is a deliberate write to PJ and never runs at installation or build time. A registration receipt is not a successful availability read.

**Do not use live keys until the rehearsal and operational decisions in [the release checklist](docs/RELEASE-CHECKLIST.md) pass.** See [verification evidence](docs/VERIFICATION.md) for what actually ran. Full Next build, browser accessibility audit, and real PJ/Stripe rehearsal have **not** passed in this environment; no such claim is made.

## Owner sequence

1. Review the public guest request. Check that the dates are free.
2. Enter the nightly amount, every fee, **exact deposit amount**, cancellation terms and balance terms. Amounts belong to this quote only.
3. Issue the quote. Its local hold does not block Airbnb automatically.
4. Block **every quoted night** on Airbnb. Wait for its export to show the full block, then refresh the owner page.
5. Only when the complete block is verified, copy and send `/book/quote/<token>` to the guest. Sending remains manual.
6. Follow payment outcomes in **Needs attention**. Never release a paid stay using the unpaid-hold action.

## Documentation

- [Install and environment contract](docs/direct-booking-setup.md)
- [Adapter route map and error behavior](docs/PJ-ADAPTER.md)
- [Review disposition / what was deliberately deferred](docs/REVIEW-DISPOSITION.md)
- [Release checklist and real rehearsal](docs/RELEASE-CHECKLIST.md)
- [Verification and limits](docs/VERIFICATION.md)
- [Source provenance](docs/SOURCE-PROVENANCE.md)

The original source snapshot and its dirty-tree history are preserved in the provenance record. No `.env` files, databases, real payment credentials, dependencies or generated build output are packaged.
