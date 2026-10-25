# Review disposition

The latest source review supersedes the proposed Google-login migration and the HTML prototype's fictional saved settings.

| Review item | Disposition in this package |
| --- | --- |
| B1: KPL source missing | Closed as a source-availability issue: full recovered site included, exact snapshot and dirty-tree lineage recorded. It does not mean deployment is verified. |
| Supabase protocol mismatch | Replaced with closed PJ REST mapping and tests for all existing operations. |
| Guest PJ account/sign-in | None. Public /book and private quote payment remain on KPL. |
| Owner login | Existing owner-code UX retained; static secret cookie replaced with a signed 12-hour session. Google/property-session migration deferred. |
| Price/deposit defaults | No saved pricing model. All native per-quote fields retained; exact deposit cents, no derived percentage. |
| Missing fee/terms fields | Pet, other fee/label, cancellation terms, balance terms retained and regression-checked. |
| Quote lifetime | Existing 48-hour/check-in cap retained; not an editable setting. |
| Owner Airbnb block | Explicit after-quote instruction; link withheld until the full block is seen. PJ rechecks at checkout. |
| Policy approvals | No fake save/proposal UI. Any active PJ policy remains authoritative; no gate activation or bypass. |
| Messaging | Manual quote delivery, no send claim or on/off toggles. |
| Calendar failure | Sanitized calendar-unavailable state; no availability guess. |
| Refund/rejected webhook loop | Durable PJ business outcomes acknowledged; transport failures retry. Owner attention and record-correction action added. |
| B9: cancellation/refund lifecycle | NOT closed. Paid cancellation and refunds remain manual operational work. Release unpaid hold is not cancellation. |
| Signed in but outside property | Google membership UI is not part of the retained KPL code-gate model. Scoped PJ service keys remain the data boundary. No fabricated Google flow. |
| Production wording | No preview badges or sample money in native booking/settings screens. Technical setup details live in docs. |
| Accessibility | Booking text/control styles improved; selected contrast ratios tested. Full rendered accessibility audit NOT performed. |
| Light/dark | Light mode deliberately retained; no theme setting introduced. |
| Hosting | Vercel project kpl/domain kendallpondlodge.com confirmed by read-only account checks. No deployment changed. |

## Deliberately not in this ZIP

Cleaner scheduling, maintenance modules, remote device controls, AI dependencies, instant-book pricing engine, email automation, automatic balance collection, Google sign-in migration, PJ shared-app screens, live provisioning, live secrets and production deployment.
