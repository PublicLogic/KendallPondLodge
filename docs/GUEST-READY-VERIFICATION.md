# Guest-ready PR: sources, scope and verification

Base: production commit `b5dfce3a10167294ba5f8a50a28ed6dc3a9ef8c7`. Reviewed October 27, 2026. This is an independent alternative to PR14, not an instruction to merge both designs.

## Source record

- Current public Airbnb listing: https://www.airbnb.com/rooms/1667597913565948713 — fetched October 27, 2026. Public structured listing description explicitly lists a king bed, queen bed, twin-over-full bunk and queen sleeper sofa, three bedrooms, two baths and eight guests maximum. Also supports two pets, driveway parking, quiet hours 10 p.m.–7 a.m., no smoking/vaping and an exterior Ring doorbell.
- Airbnb structured aggregate rating at that check: **4.83, 30 reviews**. The site labels the date and links to Airbnb. This is a manually maintained snapshot, not a live feed. Refresh or remove it when publishing future changes. No individual review quotes or Airbnb AI review summaries were republished as testimonials.
- Owner's previously published `kendall-pond-lodge.md` page (July 2026): standard check-in 3 p.m., checkout 11 a.m., self check-in, and local owner operation. Early/late arrangements require agreement. Reconfirm these operational times before release if they have changed.
- Existing source, photographs and booking contract: multi-level house, upper deck/lower patio, seasonal boating equipment, per-quote fees and terms, and confirmation after verified payment. No claim of a step-free route, sofa floor/room, vehicle capacity, year-round boats, fixed price, deposit amount, or guaranteed response deadline was invented.
- Questions use the existing configured host-contact helper, with the established Airbnb fallback. No private access codes, Wi-Fi information, booking tokens or credentials were added.

## What changed

A shorter photo-led homepage, dated guest evidence, exact sleeping plan, shared practical FAQs, quote/payment steps, consistent request language, responsive logo sizing, reduced unnecessary font preloads, mobile booking form positioning, and canonical metadata on the changed decision pages. STAY remains in the footer and booking surface. Owner and private Guidebook shells remain separate.

Actual browser findings corrected: three low-contrast text styles, gallery background scrolling while its dialog was open, and mobile menu not closing on Escape. The large gallery image is only mounted while the viewer is open; keyboard next/previous and focus restoration remain intact.

## Evidence

- Baseline: 89 core tests, 87 passing. Two old assertions expected a retired homepage class/slogan and the wrong Beta guest-footer image. Those assertions now test the current public hero and STAY identity; service safeguards were not weakened.
- New facts tests were run failing first, then passed after implementation.
- Final core suite: **93/93 passed**.
- `npm run build`: passed, including TypeScript.
- ESLint on every changed TSX file: passed.
- Chromium + axe: **36 page/viewport combinations** (nine public routes at widths 320, 390, 768 and 1440), no detected WCAG A/AA rule violations, horizontal overflow, broken visible images or uncaught browser errors.
- Interaction checks: category filtering, larger photo, arrow navigation, Escape, restored image-button focus, background scroll lock/restoration, mobile menu Escape/navigation close, keyboard-operated FAQ.
- Production calendar read-only check: selected consecutive available dates and verified hidden form dates. All non-GET/HEAD requests were blocked by the browser test. No request was submitted; no reservation, quote, payment or calendar record was created.
- Screenshots captured by the runner. Automated checks are not a human visual sign-off, full screen-reader assessment, Safari/device test, performance certification, or end-to-end payment rehearsal.

## Reproduce

Use Node 24. Run `npm ci`, `npm run test:core`, `npm run build`, then `npm run start`. In another terminal:

```sh
npm install --prefix /tmp/kpl-qa playwright@1.64.1 @axe-core/playwright@4.11.1
/tmp/kpl-qa/node_modules/.bin/playwright install chromium
NODE_PATH=/tmp/kpl-qa/node_modules node scripts/verify-guest-ui.cjs
```

Install browser system libraries if required by the operating system. The QA dependencies are deliberately not production dependencies. Set `BASE_URL` to a review deployment and `QA_OUTPUT` to an artifact directory as needed. The script blocks non-read HTTP requests and never submits a form.

Before merge: review the exact preview on a real phone, confirm operational times and the rating snapshot, and retain the existing booking/payment release process. No production merge, environment change, schema migration or payment test is authorized by this PR.
