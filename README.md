# The Lodge at Kendall Pond

This repository contains the KPL Next.js website and its direct-booking interface. The public site is hosted by Vercel project `kpl` at `https://kendallpondlodge.com`.

The booking flow is **guest request → owner’s itemized quote → verified Airbnb block → owner sends quote → Stripe deposit → verified confirmation**. Guests need no account. A request does not reserve dates, and Checkout collects the quoted deposit only.

## Working on the site

Use Node 24 (`.nvmrc`) and the included npm lockfile:

```sh
npm ci
npm run test:core
npm run build
npm run dev
```

Read [the public copy and brand standard](docs/PUBLIC-SITE-VOICE.md) before changing guest pages. Keep real property photographs and approved brand placement. Cloudflare/Sites scripts are retained for their existing purpose; Vercel is the public deployment target.

Local tests, a successful build, a deployed page and a completed payment rehearsal are different evidence. Record commands, exact revisions and limitations in [the November 1 release verification](docs/NOV1-RELEASE-VERIFICATION.md). Earlier evidence remains in [the original verification record](docs/VERIFICATION.md); it does not establish the state of a later release.

## Booking responsibilities

KPL owns the public form, private quote page, owner interface, Stripe Checkout and signed webhook adapter. PuddleJumper owns scoped booking records, payment decisions, reservations, Case linkage, reconciliation and outbound booking messages.

Every quote has exact amounts for the nightly rate, fees, taxes and deposit, plus written cancellation and balance terms. The code does not choose business policies. A Stripe return URL never confirms a booking by itself.

Initial request retries carry a stable `request_key`. The matching backend implementation must be deployed to make duplicate creation and message suppression durable. A pending button alone is not that guarantee; see the [adapter contract](docs/PJ-ADAPTER.md) and [release verification](docs/NOV1-RELEASE-VERIFICATION.md).

## Owner workflow

1. Review the request while its dates are still free.
2. Enter and issue the exact itemized quote and terms.
3. Manually block every quoted night on Airbnb, then wait for a fresh calendar read to verify the complete owner block.
4. Click **Send quote** in Owner → Bookings. Issuing a quote does not send its email.
5. Follow the verified payment state and **Needs attention**. Collect any remaining balance through the agreed process in the quote.

Request acknowledgements and confirmation messages are queued by PJ when configured. Owner messaging status distinguishes held/failed messages from provider acceptance. Provider acceptance does not prove inbox delivery.

Use the [owner runbook](docs/DIRECT-BOOKING-RUNBOOK.md) for held email, unpaid holds, balances, cancellations and corrections.

## Configuration and release

Follow [direct-booking setup](docs/direct-booking-setup.md) for the environment contract. Keep secrets in the hosting environment or private local environment files, never source control. A read-only preflight is available:

```sh
node --env-file=.env.local scripts/pj-preflight.mjs
```

Calendar registration is a separate deliberate write. Run it only after verifying the intended environment and property:

```sh
node --env-file=.env.local scripts/pj-calendar-source.mjs --apply
```

A registration receipt does not prove a fresh calendar read. A working service key does not prove property provisioning, messaging readiness or Stripe pairing.

For the November 1 release, use:

- [Release checklist](docs/RELEASE-CHECKLIST.md): release gates and unresolved owner decisions.
- [Human booking proof](docs/HUMAN-BOOKING-PROOF.md): the full current-preview acceptance run.
- [Rehearsal quick sheet](docs/BOOKING-E2E.md): the short sequence during that run.
- [Release verification](docs/NOV1-RELEASE-VERIFICATION.md): actual results and remaining limits.
- [Source provenance](docs/SOURCE-PROVENANCE.md): historical source identity, retained separately from current operating instructions.
