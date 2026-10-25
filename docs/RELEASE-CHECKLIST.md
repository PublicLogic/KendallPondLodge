# Release checklist / M5

This is an integration candidate. Do not mark it live-ready from unit tests alone.

## Build and configuration

- [ ] Inspect the source and diff against the supplied provenance.
- [ ] Use Node 24; run `npm ci` with the included lockfile, `npm run test:core`, `npm run build`.
- [ ] Keep original KPL pages/photos intact; no directory is copied into PJ's shared UI.
- [ ] Provision/verify the intended PJ workspace/property and a separate TEST key scope through the existing PJ deployment procedure.
- [ ] Load only TEST Stripe credentials and the TEST webhook secret into the KPL Preview environment.
- [ ] Register a TEST calendar source with the test property. Confirm fresh reads and the owner-blocked classification; registration status alone is insufficient.
- [ ] Verify owner passphrase/signing configuration and host-level request throttling. Old cookies should be rejected.

## Full actual-server rehearsal (not the contract fixture)

Run PJ's own `pnpm run verify:booking` as an additional backend check, then exercise **this actual KPL app** against the test PJ deployment. The PJ stand-in test alone does not verify this adapter or Next pages.

- [ ] With no browser login/cookies, submit a real test request at KPL `/book`.
- [ ] See that request once in KPL owner bookings and the intended scoped PJ records.
- [ ] Test calendar-unreadable and overlapping-date requests. No successful availability claim.
- [ ] Issue a quote with exact nightly/cleaning/pet/tax/other/deposit values and both actual test policies. Verify totals and 48-hour/check-in expiry.
- [ ] Confirm the quote link is withheld while dates are free or partly blocked.
- [ ] Block the entire interval in the test feed, refresh owner view, then open the private link in a signed-out browser.
- [ ] Accept terms, pay with Stripe test details, and see a pending state on return until PJ confirms.
- [ ] Double-click/retry checkout: reuse the existing session; never create a second charge attempt with changing parameters.
- [ ] Deliver the signed webhook; verify confirmed booking/payment and the expected reservation record/Case.
- [ ] Redeliver the same event: no duplicate reservation or changed paid timestamp.
- [ ] Simulate PJ/network/calendar failure during confirmation: webhook returns non-2xx and a later delivery settles it.
- [ ] Exercise PJ `refund_required` and `rejected`: KPL acknowledges, owner sees the durable problem, and recording a completed correction does not create a refund.
- [ ] Exercise test/live mismatch and tampered signature; neither confirms a booking.
- [ ] Release only an unpaid hold after checking/expiring any Stripe session. Never release a confirmed stay.
- [ ] Check phone/desktop layouts, keyboard operation, focus order, errors, and contrast in a rendered browser. No full browser audit is claimed by this package.

## Operational decisions before live payment

- [ ] Approve actual cancellation/refund wording and a procedure for cancelling paid stays without losing either reservation or payment evidence.
- [ ] Approve deposit amount/rules, taxes, fees and balance-collection method. This patch chooses none of these business values.
- [ ] Assign who reviews new requests and manually sends quotes. There is no automatic email promise.
- [ ] Verify the live webhook endpoint/account pairing and key/environment isolation.
- [ ] Retain rollback copy and release notes; deploy only with owner authorization.

B9 (full cancellation/refund lifecycle) remains open. M1/M2 Google-host management is deliberately deferred and is not required for this code-gated KPL test path.
