# Approved Lodge production release

Goal: publish the approved real-photo retreat homepage, finish the requested calendar/gallery polish, and close the superseded redesign.
Architecture: preserve PR15's isolated RetreatHero and accepted content; repair only the corrupt merge from PR16. Reuse BookingBrand beneath the calendar legend, not above the form. Keep actual manifest photographs and improve gallery image proportions. No payment, availability, secret, dependency, or owner-permission changes.
Authorization: the owner explicitly requested website updates, push/publication, actual Lodge photos and reconciliation of other PRs. Production release is now authorized.

- Add failing tests for the duplicated main, credit placement and gallery layout.
- Restore the accepted homepage from f8c1763; keep main's photo asset work and update its old-layout assertion to the current component design.
- Move STAY immediately below the calendar legend, tighten booking intro and balance gallery photographs.
- Run core/build/lint, 36 public viewport checks, 12 hero checks, and a read-only hosted calendar check.
- Push one commit to PR15; verify expected head before merge; confirm production deployment/domain, then close PR14 as superseded. Leave already-merged PR16 and retained branches intact.

Baseline: 97 core tests; 96 passed. The failing below-hero hash exposed 100 accidentally inserted lines (second main and second return) in the merged homepage. Do not weaken the hash guard: restore the approved source instead.

Pre-release verification: 100/100 core tests; production build and TypeScript; ESLint on all changed TSX; 36 public-page/viewport checks and 12 hero-scene checks passed. The original approved below-hero SHA guard passes without modification. Hosted calendar credit/selection and production-domain verification follow the push; do not count those as complete until observed.
