# November 1 release verification

Recorded October 27, 2026. Target release: November 1, 2026.

## Scope and source

The website changes build on `9a51f1e7491c1354b5d7504170954fad6c5beea7`, the approved rural pond header. The heading, property photos, layout and booking brand placement are preserved. The release adds practical local guides, distinct search metadata, a request progress state, retry identity and an acknowledged receipt state. It reconciles the operating instructions with the explicit owner **Send quote** workflow.

The booking remains request → owner itemized quote → deposit → verified confirmation. No price, deposit percentage, cancellation policy, response deadline or balance-collection rule is adopted by these changes.

## Executed verification

| Check | Result | Scope |
| --- | --- | --- |
| Locked dependency installation | Passed | `npm ci --ignore-scripts --no-audit --no-fund`, Node 24.22.1. |
| Core regression suite | Passed: 107 tests, 0 failed | `npm run test:core`, including real local HTTP transport, calendar/payment safeguards, brand placement and new retry-identity behavior. |
| Production build | Passed | `npm run build`; Next.js compiled and generated the route output. |
| Changed runtime JavaScript/TypeScript lint | Passed | ESLint over the changed page/components, actions, booking helpers and test files. The declaration file retains four pre-existing `no-explicit-any` findings, reproduced on the base revision; its optional request-key field is typechecked by the production build. |
| Whitespace validation | Passed | `git diff --check`. |
| Preview and production deployment | Passed | PR #19 merged as `7978e5ceb7ed8490bedbfdcb0e8668cf495b86d9`; Vercel production `dpl_8uJfCqwXhpEZD51NHmeUseoQjaYx` reached READY with `kendallpondlodge.com` assigned. The merged source tree matches the reviewed tree. |
| Live desktop/browser verification | Passed for the inspected paths | Home, Explore, Area, Events and Book display the new content. Selecting November 3–5 showed two nights and enabled the request button; the selection was cleared without submitting. STAY remains below the calendar legend and before guest fields. No horizontal overflow was observed on the inspected home/Explore desktop viewport. |
| Live desktop keyboard inspection | Passed for the inspected flow | On published revision `a48e2eee1d24e8a90a963b45add15ce2805169c9` at 1363 × 936: skip link, navigation, available calendar dates, month controls, Clear, labeled fields, consent and the request button were keyboard reachable. Enter/Space selected November 3–5; Clear restored the disabled request button. No guest details were entered or request submitted. |
| Full phone and transactional browser proof | Not completed | Desktop inspection and helper tests do not prove phone rendering, actual submit/redirect handling, delivered email or hosted payment. |
| Real payment/email rehearsal | Not completed | Requires the current deployed backend, an isolated test property/calendar, authorized owner access and controlled recipients. |

The local HTTP contract test initially could not open its loopback listener inside the restricted execution sandbox. It passed with local network permission, and the complete suite above was then run with that permission. The fixture transport test is not an actual PJ/Stripe rehearsal. Final live inspection also identified a pre-existing misencoded arrow in shared guide links; the narrow follow-up replaces it with the CSS Unicode escape for a right arrow.

The keyboard follow-up strengthens the form input/textarea/consent focus outline from `#8dc5b1`
to the existing dark green `#205f43`, preserving the 3px outline and 2px offset. Calculated contrast
against white increases from 1.95:1 to 7.56:1; this is a color-pair measurement, not an accessibility
conformance assessment. Use the follow-up PR/deployment evidence for the published CSS check.
Calendar interaction was verified with Tab/Shift+Tab and Enter/Space; Right Arrow did not move
between dates. Screen-reader announcements, phone layout and actual submission remain separate
unverified checks.

## Retry behavior and limits

The browser keeps a random `request_key` and a SHA-256 fingerprint of the normalized request in per-tab session storage. It does not store plaintext guest contact details, dates or notes there. An unchanged retry or reload reuses the identity; changed input receives a new identity. If browser storage is unavailable, the open form retains its identity in memory. A successful awaited action clears only its own matching saved key and replaces the form with a **Request another stay** link. A stale receipt page cannot clear a newer pending key, and an earlier error disappears when the receipt is shown.

KPL validates and forwards the optional key. Durable request and message deduplication requires the corresponding deployed backend contract. A previous backend may ignore the field; the client alone cannot guarantee deduplication. New-request availability safeguards remain in place.

A retry after an owner later blocks or holds the dates can stop at KPL's fresh availability preflight before reaching backend replay. The public message directs the guest to check with the hosts. This release does not add a lookup endpoint or bypass that preflight.

## Release gates still requiring evidence

- Exact current KPL and backend deployment identities, with backend support for durable request-key replay.
- An isolated test workspace/property, fresh controlled calendar and paired Stripe test origin/key/webhook configuration.
- Authorized sender, provider connection and controlled guest/owner inbox receipt, recorded separately from provider acceptance.
- Signed-out request, owner quote, full manual block, explicit quote send, test Checkout, signed webhook and one confirmed reservation/Case.
- Initial-request retry, webhook replay and the failure/recovery paths in [the human proof](HUMAN-BOOKING-PROOF.md).
- The owner's real coverage, payment, cancellation and balance decisions in [the operating runbook](DIRECT-BOOKING-RUNBOOK.md).

Use the release PR and hosting deployment record for the published commit and final browser evidence. Keep guest records, private quote URLs, credentials and calendar-source URLs out of this public repository.

## Rollback reference

The prior reviewed website source is `9a51f1e7491c1354b5d7504170954fad6c5beea7`. A website rollback does not undo backend records, queued messages, Stripe activity or manual Airbnb blocks. Preserve and reconcile those records separately.
