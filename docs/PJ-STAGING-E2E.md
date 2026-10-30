# PJ staging E2E rehearsal

This branch exists only to provide a stable Vercel Preview target for the
PuddleJumper staging direct-booking rehearsal.

It must use Preview/test credentials only:

- KPL direct booking enabled in Preview
- KPL Preview Stripe test mode only
- a staging/test PuddleJumper booking key
- the staging PuddleJumper booking API URL
- no live guest payment or provider credentials

Production Kendall Pond Lodge configuration is not changed by this branch.

The proof checklist is [BOOKING-E2E.md](BOOKING-E2E.md).
