# Source provenance — 25 October 2026

## KPL source, preserved lineage

Input: `KPL_Source_Review(1).zip` (SHA-256 `6706cc0d967d015592e05ea7300a1e3decd82fcd7465abfc50e18ca91be8b632`).
The archive's `KPL_REVIEW_CONTEXT.txt` identifies commit
`7316f4121b8f30795cf963c5e94e7b6f271084b9`, branch `main`, with a **dirty working tree**:
`lib/booking-db.ts` was modified and `lib/booking-db.ts.supabase-backup` was untracked.
This release starts from the archive's actual `source/` bytes, not a claim that the dirty files equal the commit.
The input archive and scratch baseline were left unchanged.

Excluded upstream: `.npmrc`, `.openai/hosting.json`, and `build/sites-vite-plugin.ts`.
The legacy Cloudflare/Sites build is therefore not a supported release path here. This package targets the existing Next.js/Vercel path.
The obsolete `.supabase-backup` and two old PostgREST transport helper files are removed from this release; their originals remain in the input archive.
`db/booking.sql` remains historical source evidence, not an installation step or a second live database.

## Verified destination and integration target

- KPL destination: `PublicLogic/KendallPondLodge`. The connected repository was empty when read on 25 October 2026.
- Host: the existing Vercel project `kpl`; `kendallpondlodge.com` was mapped to that project. No routing, deployment, configuration, or environment values were changed.
- PJ contract inspected at `PublicLogic/PuddleJumper`, revision `90042243a1caaec577d1e2882c1bb68d98becdd5`.
- Read references: `KPL-BASELINE.md`, `AGENTS.md`, `docs/KPL-ADAPTER.md`, `docs/stayos-booking-contract.md`, `docs/BOOKING-SETTINGS.md`, and the actual booking routes, service, content routes, and KPL policy/access code.
- PJ's current README keeps KPL screens in KPL's repository. This release changes **no PJ source**. It requires an appropriately configured PJ deployment; it does not provision that deployment.

## Authorized release boundary

Public request, private quote, hosted deposit checkout, webhook confirmation, owner bookings, and read-only owner setup. Guests have no PJ account requirement. Existing code-gated owner access remains, strengthened with randomized signed 12-hour sessions. Google-based PJ host management and cleaner functions are not added.
Rates, fees, exact deposit amount, tax, cancellation terms, and balance terms remain per-quote inputs. No illustrative values were adopted as policy. Quotes retain KPL's 48-hour/check-in cap. Policy enforcement, where enabled, stays with PJ.

The approved STAY and PJ Beta PNGs are copied byte-for-byte; see the JSON companion for hashes. KPL's photographs and unrelated source pages remain from the input snapshot.
No font files, credentials, `.env.local`, database files, dependencies, `.git` history, or compiled output are included.

## Evidence, not assumptions

See [VERIFICATION.md](VERIFICATION.md). Unit and local HTTP-fixture tests passed; production build, full typecheck, actual PJ plus Stripe rehearsal, browser rendering, and accessibility audit were not completed. A temporary isolated dependency-installation probe used Node 24, but **the KPL app was not built there**; that temporary sandbox was stopped.

Machine-readable lineage: [SOURCE-PROVENANCE.json](SOURCE-PROVENANCE.json).
The root `SHA256SUMS.txt` covers the packaged file bytes except the checksum file itself.
