# Verification — integration candidate, not live-ready

## Actual results

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| `npm run test:core` | **70 passed, 0 failed, 0 skipped** | Native Node tests; Node v22.16.0, npm 10.9.2. [Raw output](verification/core-tests.txt). Target deployment is Node 24, so rerun there. |
| TypeScript/TSX syntax parse | **69 files; no syntax diagnostics** | Global TypeScript 5.8.3 parser. [JSON](verification/typescript-syntax.json). This is **not** type checking and not a Next build. |
| `npm run build` | **BLOCKED / exit 127** | `next: not found` in the local verification environment. [Raw attempt](verification/production-build-attempt.txt). Dependencies were not installed locally; no production build passed. |
| Guarded patch installer | **6 checks passed** | Dry-run, applied-file equality, repeat application, baseline mismatch, wrong-project refusal, symlink refusal and tampered-payload refusal. Some checks are combined in a test. [Raw output](verification/patch-installer-tests.txt). |
| Native HTTP contract fixture | **Passed within the 70 tests** | Exercises the actual adapter over localhost HTTP against a small envelope/route fixture. It is **not the PJ server** and not M5. |
| New owner-session regression | **Red, then green** | [Recorded red result](verification/owner-binding-regression-red.txt); final suite passes. Cookie payload no longer exposes the owner-code hash. |
| Selected color pairs | **Passed within the 70 tests** | Contrast calculations for specified booking foreground/background pairs only. Not an accessibility conformance claim. |
| Next typecheck, browser layout, automated accessibility | **NOT RUN** | Must run on the installed app. |
| Real KPL → PJ → Stripe test-mode rehearsal | **NOT RUN** | Must use the actual KPL build, isolated PJ property/key and test calendar, plus matching Stripe test credentials. |
| Dependency security audit | **NOT RUN** | Original dependency versions retained. Install from the lockfile and audit before live release. |
| Deployment, live payment, real guest notification | **NOT PERFORMED** | No repository commit/push, property provisioning, webhook registration, or production change. |

## Tests exercise

The nine existing KPL operation mappings; exact PJ envelope handling; server-only bearer/request-header behavior; token-in-body lookup; constrained paths and safe errors; malformed/foreign-scope responses; timeout and redirect refusal; complete per-quote fee and terms presence; public booking without owner auth; no fake localStorage settings; and original calendar/date/money logic.

Payment tests cover raw-body signature and timestamp validation; test/live separation; paid versus unpaid events; exact server-side deposit; durable PJ refund/rejection outcomes acknowledged with 200; transient/invalid-response failures returned for retry; stable Stripe idempotency parameters; existing session reuse; attach-before-redirect; and no automatic second charge on an uncertain result.

The contract explicitly permits a 200 `{ ok: false }` for an unmatched scope. KPL acknowledges it without claiming that PJ created a reconciliation item for it. Unknown event/metadata problems still need operational monitoring.

Owner-session tests cover random nonces, tampering, expiry, signing-key/code rotation, rejection of the former static secret cookie, and absence of the code hash from the readable token payload. This is still a shared owner-code gate, not per-person accounts or a grant model.

## Important limits

- The old `rendered-html.test.mjs` requires the inherited Cloudflare build. It is not silently counted in the 70 tests; `test:sites` remains separate and was not run.
- Unit tests cannot prove Next server-action wiring, browser behavior, a live PJ schema/property, webhook delivery, or Stripe account pairing. `npm run test` deliberately still includes the real build and is not claimed to pass.
- B1 is closed **only as source availability**. B9, a complete cancellation/refund lifecycle for confirmed stays, remains open. The owner can record a correction already made; that action does not issue a refund, cancel a confirmed booking, or unblock Airbnb.
- Rates, taxes, deposit rules, cancellation wording, balance collection and manual communication responsibilities still require owner decisions. No sample pricing is activated.
- No availability result is fabricated when the calendar cannot be read. No checkout redirect alone creates a confirmed booking.

Follow [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md) before live payment.
