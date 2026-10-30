# PuddleJumper → Kendall Pond Lodge capability map

Audit date: October 30, 2026. Source: PublicLogic/PuddleJumper main branch, connected KPL website repository, read-only Fly app metadata. **Code present does not mean a capability is deployed or operational.**

## The operating rule

**PJ owns governed data, rules, source custody, evidence, and operational decisions. KPL presents approved guest information.** Avoid duplicate API/provider stacks simply because a new website page needs some data.

## Source inventory

| Capability in PJ | Key source | Intended use |
| --- | --- | --- |
| PRR state machine | packages/logic-commons-runtime/src/prrMachine.ts and workItems.ts | Governed work transitions and blocked decisions |
| CAL gate | packages/logic-commons-runtime/src/cal.ts | Required fields and stop rules |
| PRM permissions | packages/logic-commons-runtime/src/prm.ts | Decider and actor authority |
| ARCHIEVE | packages/logic-commons-runtime/src/archieve.ts | Sealed evidence and hash chain |
| CaseSpace / evidence | packages/casespace-view and packages/db/src/caseProof.ts | Durable case and audit record |
| STAY properties / Today | apps/puddlejumper/src/stayos/stayosRoutes.ts and today.ts | Owner dashboard, readiness, arrivals/departures, tasks |
| Airbnb iCal | apps/puddlejumper/src/stayos/airbnbIcalSync.ts | Scoped availability, owner blocks, reservation import |
| Booking | apps/puddlejumper/src/stayos/booking/* and kpl/policy.ts | Governed pricing, direct holds, payment reconciliation |
| Ask Kendall / inquiry | apps/puddlejumper/src/stayos/inquiry/* | Guest escalation, conversations and Case linking |
| Stay lifecycle | apps/puddlejumper/src/stayos/kpl/lifecycle.ts | Guest links and role-scoped lifecycle, closure evidence |
| Automations | apps/puddlejumper/src/stayos/automation-scheduling.ts, automationWorker.ts | Message schedules and held/retry states |
| Finance / obligations | apps/puddlejumper/src/stayos/treasury.ts, recurringObligations.ts | Owner-only money tracking and due items |
| Runtime / connectors | apps/puddlejumper/src/api/routes/governance.ts, interface.ts, outboundCommunications.ts | Approval gate, role-scoped interfaces, messaging |

The repository also contains data migrations for content authority, case-scoped grants, audit proof, and connection contracts. None of those should be treated as proof of a particular deployment's revision.

## PJ's existing Explore sources: do not duplicate

**MBTA:** In [providers.ts](https://github.com/PublicLogic/PuddleJumper/blob/main/apps/puddlejumper/src/stayos/content/providers.ts), PJ already reads MBTA V3 schedules, predictions and alerts for Wachusett Station (place-FR-3338), Fitchburg Line (CR-Fitchburg). Its public transit projection includes check time, provider status, departure schedules, expected departures when available, service alerts and availability flags. Raw provider snapshots are owner-scoped. The provider refresh is coalesced and limited to roughly one minute. Source tests: [stayos-content.test.ts](https://github.com/PublicLogic/PuddleJumper/blob/main/apps/puddlejumper/test/stayos-content.test.ts).

**City of Gardner events:** PJ's [publicCalendar.ts](https://github.com/PublicLogic/PuddleJumper/blob/main/apps/puddlejumper/src/stayos/content/publicCalendar.ts) imports the City of Gardner community calendar iCal feed. Its roughly 15-minute refresh, event filtering and expiry protection are in the provider and store. The composed Explore public record includes these events.

**Curated places and links:** PJ's [kplSeed.ts](https://github.com/PublicLogic/PuddleJumper/blob/main/apps/puddlejumper/src/stayos/content/kplSeed.ts) already has sourced public records including Dunn State Park, Wachusett Mountain, Gardner Ale House, the Chamber events link, regional directories, the Wachusett train station, and MART. Dated events expire.

**Greater Gardner Chamber:** PJ holds a curated Chamber EVENTS LINK and example Chamber event records. There is no evidence in the inspected source of a live Chamber events API ingestion. The continuously refreshed municipal calendar is from the City of Gardner, not the Chamber.

## Public API and security boundary

The PJ [contentRoutes.ts](https://github.com/PublicLogic/PuddleJumper/blob/main/apps/puddlejumper/src/stayos/content/contentRoutes.ts) exposes:

- GET /api/stayos/content/public/explore → public payload containing items, transit, calendars, source dates.
- GET /api/stayos/content/public/records/:id → approved public record only.
- Protected owner/guest routes require their corresponding scoped credentials and controls.

PJ mounts the content router in [server.ts](https://github.com/PublicLogic/PuddleJumper/blob/main/apps/puddlejumper/src/api/server.ts) only when STAYOS_KPL_WORKSPACE_ID is configured. The public route itself needs **no** booking bearer key. Never send KPL_STORE_KEY into the guest browser or a public call. Private provider custody records, staff grants and booking information must remain separate from Explore.

## What the KPL Explore PR now does

- A server-only PJ adapter resolves the published public Explore endpoint from KPL's already-trusted KPL_STORE_URL origin. It sends no booking credential and validates the shape and event links.
- The train display uses the **PJ projection** and can show predicted vs scheduled departures and MBTA notices when PJ's snapshot is fresh. If PJ is offline/unconfigured/stale, it shows official MBTA and MART links with no invented times.
- A community-events section presents sourced upcoming events from PJ's public Explore record, with City and Chamber calendar links, event expiry filtering, and honest fallback.
- Eleven extra site-authored editorial suggestions remain in the website for now. Their long-term authority should move into versioned PJ curated records; no second transport feed remains in KPL.
- The guest booking form, Stripe, private owner views, direct price policies, and Airbnb booking guards remain unchanged.

## Operational verification: still required

Confirmed from repository: MBTA API provider, municipal feed, public Explore composition, scoped access, and source tests exist.

Confirmed from Fly metadata on Oct 30: publiclogic-puddlejumper reports deployed (one started, one stopped Machine); publiclogic-kpl-store reports deployed (one started Machine). **This does not establish live deployed git SHAs, the publishing-workspace environment flag, or a successful public Explore API response.** Available remote access could not independently retrieve the public endpoint, so do not claim the live website currently shows PJ predictions.

Before a production release of the Explore PR:

1. Identify which PJ deployment the KPL Preview/Production server's KPL_STORE_URL points to.
2. Confirm the target PJ process has the code and STAYOS_KPL_WORKSPACE_ID configured for the intended public publishing scope.
3. Verify GET /api/stayos/content/public/explore **from the KPL server environment**, without exposing secrets, checking the public schema, MBTA checkedAt/availability, predictions/alerts, and City calendar status.
4. Test current data, stale data, unavailable data, no departures, expired events, and narrow/mobile views.
5. Preserve the separate private booking and owner boundaries. Merge the draft only after review.

## Follow-on capabilities without rebuilding

- Guest arrival: PJ's controlled guest-access and guide records, never private owner data.
- Host operations: Today, readiness, turnover, service messages, booking attention (owner/staff only).
- Source-backed seasonal guide: PJ's curated content with versioning, review, dates and expiry.
- Event alerts or guest hints: only after actual provider, sender, permissions and visibility tests.

**Source code is real; deployment proof is a separate gate.** PJ first, then the guest-facing KPL surface.
