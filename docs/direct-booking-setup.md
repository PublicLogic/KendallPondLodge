# KPL direct booking setup — PJ adapter

## Before switching traffic

This package is KPL's Next.js app. It does not become part of PJ's shared `/app/` UI, change PJ's policy, or migrate owners to Google. The inspected host is Vercel project `kpl`; the new source destination is `PublicLogic/KendallPondLodge`.

Use Node 24 and the included npm lockfile. Run `npm ci`, `npm run test:core`, and `npm run build` locally/CI. There is no deploy command in the adapter installation.

## Server configuration

| Variable | Meaning |
| --- | --- |
| `KPL_STORE_URL` | Full PJ base: `https://YOUR-PJ-ORIGIN/api/stayos/booking`. HTTPS required; trailing slash accepted. No Supabase REST endpoint. |
| `KPL_STORE_KEY` | Opaque scoped service key, at least 32 characters. PJ stores its SHA-256 in `STAYOS_BOOKING_KEYS`; the raw value stays in KPL server environment. |
| `KPL_BOOKING_ORIGIN` | Trusted public HTTPS origin for Stripe return links, normally `https://kendallpondlodge.com`. |
| `KPL_DIRECT_BOOKING_ENABLED` | Exact value `true` opens requests once the store configuration is valid. This does not prove a healthy calendar or payment setup. |
| `KPL_AIRBNB_ICAL_URL` | Private Airbnb export, used for KPL's owner checks and explicit server-to-server registration with PJ. Never expose it to a browser or log it. |
| `STRIPE_SECRET_KEY` | Matching test or live account key. Test mode for rehearsal. |
| `STRIPE_WEBHOOK_SECRET` | Secret belonging to the same environment's endpoint `/api/stripe/webhook`. |
| `KPL_BOOKING_CONTACT_EMAIL` | Optional real contact address. Without it the UI retains the Airbnb contact fallback. |
| `KPL_OWNER_CODE_HASH` | SHA-256 hex of the owner's strong passphrase. No development bypass is accepted by the new owner module. |
| `KPL_OWNER_SESSION_TOKEN` | Existing name, now used as an HMAC signing secret of at least 32 characters. It is not sent as a cookie. |
| `KPL_GUIDEBOOK_CODE_HASH`, `KPL_GUIDEBOOK_SESSION_TOKEN` | Existing separate guidebook settings; no changes to the guest guidebook access model in this patch. |

There are no `NEXT_PUBLIC_` booking secrets and no Supabase fallback. Do not import real production environment files into source control.

## PJ side

The existing PJ booking deployment must have its runtime migrations, property row, workspace and key scope in place. Configure Preview/test separately from live. A working key does not prove a property row exists. This ZIP deliberately does not create or modify the live property, keys, database, identity membership, or policies.

Consult the PJ repository's `docs/DEPLOYMENT-PLAN.md`, `docs/stayos-booking-contract.md` and `docs/BOOKING-SETTINGS.md` at the inspected revision. Do not insert guessed SQL or silently activate `KPL_BOOKING_POLICY_SCOPES` as a deployment side effect.

When the key is verified as belonging to the intended property, load the KPL environment and run:

```sh
node --env-file=.env.local scripts/pj-preflight.mjs
node --env-file=.env.local scripts/pj-calendar-source.mjs --apply
```

The first command is read-only. The second registers the private calendar with PJ. Its URL is never printed. Run only with the environment/property you intend to change.

## Quoting and checkout

Every quote contains exact whole-cent values for nightly rate, cleaning, pet, tax, other fee with label, deposit and total. Cancellation terms and balance terms must each contain at least 20 characters. The total is computed from the quote inputs. The deposit is an amount, not a percentage; any independently enabled PJ policy still applies.

KPL's expiry is `min(now + 48 hours, check-in date at 00:00 UTC)`, preserving the source code's existing cap. More than 65 minutes must remain to begin payment. This is not exposed as an editable setting. Checkout expiry is anchored to the first recorded checkout start, with a stable Stripe idempotency key.

The quote is created while dates are free. The owner then manually blocks every night on Airbnb and waits for the fresh export to show `owner-blocked`. Only then does the owner page show the link ready to send. PJ checks again before checkout. A missing or unreadable calendar fails closed.

## Payment outcomes

KPL reads the raw webhook body with a size bound, verifies its signature and test/live mode, and reports a paid USD Checkout Session to PJ. It sends no amount selected by a browser.

- `ok: true`: acknowledge; PJ owns the booking decision.
- `refund_required` or `rejected`: acknowledge; PJ has persisted the issue. Owner handles it through Stripe and records a correction note.
- `{ ok: false }` without a code: acknowledge under the inspected contract, log the unmatched outcome for operator investigation. This can indicate a wrong property key; it is not a confirmed booking and does not establish a reconciliation record in this scope.
- Network error, timeout, invalid envelope, or upstream non-2xx: return 503 so Stripe can retry.

No charge, refund, cancellation, email or publication is performed by setup scripts or source extraction.

## Owner access

The existing code-based login remains. The new cookie is randomized, signed, HttpOnly, SameSite=Lax, Secure in production, and expires after 12 hours. Rotating the signing secret or code hash invalidates it. Existing cookies are rejected and require a new sign-in.

This is still a shared-owner gate, not per-person Google identity or grant-based attribution. Use a high-entropy passphrase and host-level request throttling. Logout clears the browser cookie; the design does not provide a per-session server revocation registry. Those are explicit limits, not hidden claims of complete identity management.

## Messaging, cancellation and appearance

Delivery of quotes remains manual. No messaging toggle is added. The UI does not claim that PJ messages have been sent or that a disabled provider is active.

Unpaid holds can be released. Confirmed-stay cancellation, automated refunds and collection of the later balance are not implemented by this adapter. Decide and rehearse the manual workflow before enabling live payments. Recording a correction note does not refund a card or cancel the stay.

Light mode is deliberate for this release. Approved logo PNGs are included unchanged. Booking-specific contrast pairs and minimum control styles are checked in code; this is not a complete browser accessibility certification.
