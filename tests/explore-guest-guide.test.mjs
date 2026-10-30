import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const page = read("app/explore/page.tsx");
const css = read("app/explore/explore.module.css");
const data = read("app/explore/guide-data.ts");
const directory = read("app/explore/ExploreDirectory.tsx");
const train = read("app/explore/WachusettRail.tsx");
const manifest = JSON.parse(read("public/images/kpl/website-top-50/manifest.json"));

test("Explore has authentic Lodge photography, editorial day plans and distinct guide navigation", () => {
  assert.match(page, /data-curated-explore/);
  assert.match(page, /When you feel/);
  assert.match(page, /id="days"/);
  assert.match(page, /id="local-picks"/);
  assert.match(page, /id="around-town"/);
  assert.match(page, /<WachusettRail \/>/);
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

test("Wachusett train board uses MBTA feed without invented times or transit guarantees", () => {
  assert.match(train, /https:\/\/api-v3\.mbta\.com\/schedules/);
  assert.match(train, /place-FR-3338/);
  assert.match(train, /CR-Fitchburg/);
  assert.match(train, /filter\[direction_id\]/);
  assert.match(train, /revalidate: 120/);
  assert.match(train, /Number\.isFinite/);
  assert.match(train, /timeZone: "America\/New_York"/);
  assert.match(train, /return null/);
  assert.match(train, /No verified departure times to display right now/);
  assert.match(train, /not a live estimate/);
  assert.match(train, /not at the Lodge/);
  assert.match(train, /fare-free Gardner/);
  assert.match(train, /weekdays, excluding holidays/);
  assert.match(train, /localResourceLinks\.fitchburgLine/);
  assert.match(train, /localResourceLinks\.martShuttle/);
  assert.doesNotMatch(train, /const times = \[|Next train in|random|setInterval/);
});

test("Explore routes guests back to the established booking and property system", () => {
  assert.match(page, /directBookingEnabled\(\) \? "\/book" : "\/rates"/);
  assert.match(page, /href=\{bookingHref\}/);
  assert.match(page, /href="\/area"/);
  assert.match(page, /href="\/lodge"/);
  assert.match(page, /Check your dates/);
  assert.doesNotMatch(page, /send (your|us) dates|send.*quote|pay to reserve immediately/i);
});
