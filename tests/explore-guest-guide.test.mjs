import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const page = read("app/explore/page.tsx");
const css = read("app/explore/explore.module.css");
const data = read("app/explore/guide-data.ts");
const directory = read("app/explore/ExploreDirectory.tsx");
const train = read("app/explore/WachusettRail.tsx");
const pj = read("app/explore/pjExplore.ts");
const city = read("app/explore/CommunityEvents.tsx");
const manifest = JSON.parse(read("public/images/kpl/website-top-50/manifest.json"));

test("Explore has authentic Lodge photography, editorial day plans and distinct guide navigation", () => {
  assert.match(page, /data-curated-explore/);
  assert.match(page, /When you feel/);
  assert.match(page, /id="days"/);
  assert.match(page, /id="local-picks"/);
  assert.match(page, /id="around-town"/);
  assert.match(page, /<WachusettRail transit=\{feed\?\.transit \?\? null\} \/>/);
  assert.match(page, /<CommunityEvents feed=\{feed\} \/>/);
  assert.match(page, /<ExploreDirectory \/>/);
  assert.match(page, /lodgePhoto\(49\)/);
  assert.match(page, /lodgePhoto\(35\)/);
  assert.equal(manifest.photos.find(item => item.order === 49)?.category, "09-Waterfront-and-Grounds");
  assert.match(page, /alt=\{pondPhoto\.alt\}/);
  assert.match(page, /alt=\{deckPhoto\.alt\}/);
  assert.doesNotMatch(page, /<PageHero|<InfoCard|<PhotoCard|stock|unsplash|pexels|KP2|KP3|pond-aerials/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /@media \(max-width: 600px\)/);
});

test("Local guide is curated, source-linked and filterable rather than a fake ranking", () => {
  assert.match(data, /Blue Moon Diner/);
  assert.match(data, /Cafe Edesia/);
  assert.match(data, /Gardner Ale House/);
  assert.match(data, /Red Apple Farm/);
  assert.match(data, /Fitchburg Art Museum/);
  assert.match(data, /Wachusett Mountain State Reservation/);
  assert.match(data, /https:\/\/www\.mass\.gov\/locations\/dunn-state-park/);
  assert.match(data, /https:\/\/www\.wachusett\.com\//);
  assert.match(data, /https:\/\/business\.gardnerma\.com\/list/);
  assert.doesNotMatch(data, /gardnerchamber\.com|gardnerchamber\.org/);
  assert.match(directory, /useState/);
  assert.match(directory, /aria-pressed=\{selected === option\.id\}/);
  assert.match(directory, /aria-controls="explore-picks"/);
  assert.match(directory, /role="status"/);
  assert.match(directory, /target="_blank"/);
});

test("Chamber feeds remain first-party and event details are not hard-coded stale", () => {
  assert.match(data, /https:\/\/business\.gardnerma\.com\/events/);
  assert.match(data, /https:\/\/business\.gardnerma\.com\/list/);
  assert.match(page, /localResourceLinks\.chamberEvents/);
  assert.match(page, /localResourceLinks\.chamberDirectory/);
  assert.match(page, /localResourceLinks\.chamberRestaurants/);
  assert.match(page, /maintained by the Greater Gardner Chamber/);
  assert.doesNotMatch(page, /2026 Women in Business|November 12|Oct 30, 2026/);
});

test("Wachusett trains come from PJ public Explore, not a second MBTA integration", () => {
  assert.match(pj, /import "server-only"/);
  assert.match(pj, /process\.env\.KPL_STORE_URL/);
  assert.match(pj, /\/api\/stay(os)?\/content\/public\/explore/);
  assert.match(pj, /next: \{ revalidate: 60 \}/);
  assert.match(pj, /redirect: "error"/);
  assert.match(pj, /AbortSignal\.timeout\(4500\)/);
  assert.match(pj, /if \(!response\.ok/);
  assert.match(pj, /return null/);
  assert.match(page, /const feed = await loadPjExplore\(\)/);
  assert.match(page, /const dynamic = "force-dynamic"/);
  assert.match(train, /import type \{ PjTransit \}/);
  assert.match(train, /transit\?\.predictionsAvailable/);
  assert.match(train, /transit\.alerts/);
  assert.match(train, /10 \* 60_000/);
  assert.match(train, /MBTA predicted departure/);
  assert.match(train, /Scheduled departure/);
  assert.match(train, /verified train feed isn't available here right now/);
  assert.match(train, /localResourceLinks\.fitchburgLine/);
  assert.match(train, /localResourceLinks\.martShuttle/);
  assert.match(train, /weekdays, excluding holidays/);
  // Only PuddleJumper may fetch raw schedules/predictions/alerts.
  assert.doesNotMatch(train + page + pj, /api-v3\.mbta\.com/);
  assert.doesNotMatch(pj, /process\.env\.KPL_STORE_KEY|process\.env\.STRIPE_SECRET_KEY|Authorization:\s*`Bearer/);
});

test("Existing PJ Gardner community calendar is displayed with provenance", () => {
  assert.match(pj, /parseEvents\(payload\.items\)/);
  assert.match(pj, /gardnerCalendarStatus/);
  assert.match(pj, /item\.type !== "event"/);
  assert.match(pj, /expiresAt/);
  assert.match(city, /id="city-events"/);
  assert.match(city, /feed\?\.events/);
  assert.match(city, /event\.sourceName/);
  assert.match(city, /event\.date/);
  assert.match(city, /gardnerCalendarStatus/);
  assert.match(city, /City of Gardner calendar/);
  assert.match(city, /localResourceLinks\.chamberEvents/);
  assert.match(city, /PJ's event feed isn't available/);
});

test("Explore routes guests back to the established booking and property system", () => {
  assert.match(page, /directBookingEnabled\(\) \? "\/book" : "\/rates"/);
  assert.match(page, /href=\{bookingHref\}/);
  assert.match(page, /href="\/area"/);
  assert.match(page, /href="\/lodge"/);
  assert.match(page, /Check your dates/);
  assert.doesNotMatch(page, /send (your|us) dates|send.*quote|pay to reserve immediately/i);
});
