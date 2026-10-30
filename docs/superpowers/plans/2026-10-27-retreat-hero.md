# Couples-first waterfront hero

Goal: revise only PR15's hero, taking the experience-first, time-together positioning from the user's Bolt Farm Treehouse reference. The rest of the accepted page, STAY identity and booking logic remain unchanged.

Design: real pond photography leads; smaller, calm typography reads “Make time for each other.” Supporting copy describes coffee on the deck and a hot-tub soak, not resort amenities. Three visitor-controlled scenes (water, hot tub, deck) show the actual Lodge. No autoplay, video, stock photographs, adults-only restriction, spa claim, guaranteed privacy or relationship outcome. Capacity remains in the accepted content below the hero.

Approach: rejected another oversized slogan over the exterior, and rejected an autoplay slideshow. Use a small isolated client component for scene selection and a scoped CSS module; the server page still supplies the existing enabled/Airbnb routing. This keeps the below-hero output byte-identical.

Plan: write failing scope/hero tests; implement the isolated component and styles; run core tests/build/lint; exercise all three scenes, keyboard navigation, reduced motion and small-screen layout; publish a fast-forward commit to the existing PR15 branch only. No production merge.

Source: https://www.boltfarmtreehouse.com/couples-retreat, reviewed October 27, 2026. Borrow positioning and photographic emphasis, not copy, images, amenities or testimonials.

Verification: 96/96 core tests; Next production build and TypeScript; lint on changed TSX; all 36 existing public-page/viewport checks passed again. The new hero passed 12 additional checks (three scenes at four widths) with keyboard activation, loaded images, reduced-motion preference, no horizontal overflow, no uncaught browser errors, and no detected violations in the selected axe WCAG A/AA rules. Desktop and phone screenshot composition was inspected. The test pins the approved below-hero source to its original SHA-256. No live form or payment submission. Real Safari/device and complete screen-reader certification remain outside this check.

Reproduce the additional hero check with the existing optional QA tooling: `NODE_PATH=/tmp/kpl-qa/node_modules node scripts/verify-retreat-hero.cjs`. BASE_URL and QA_OUTPUT may override the default local server and artifact folder.
