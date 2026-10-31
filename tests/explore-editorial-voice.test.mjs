import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const page = read("app/explore/page.tsx");
const guide = read("app/explore/guide-data.ts");
const directory = read("app/explore/ExploreDirectory.tsx");
const rail = read("app/explore/WachusettRail.tsx");
const events = read("app/explore/CommunityEvents.tsx");

test("Explore sounds like a local guest guide, not a generic marketing directory", () => {
  assert.match(page, /Worth leaving the dock for/);
  assert.match(page, /Gardner/);
  assert.match(page, /Local favorites/);
  assert.match(page, /href="#train"/);
  assert.match(page, /href="#city-events"/);
  assert.doesNotMatch(page, /Nate.s local picks|make memories|curated experience|perfect getaway|hidden gems/i);
});

test("Explore keeps actual local destinations and skips invented itineraries", () => {
  for (const business of ["Smith's Country Cheese", "Priscilla Candy Shop", "Gardner Ale House", "Red Apple Farm", "Wachusett Mountain"]) {
    assert.ok(guide.includes(business), "Missing local place: " + business);
  }
  assert.doesNotMatch(page, /id="days"|Three easy ways to spend a day/);
  assert.doesNotMatch(guide, /top rated|number one|best in Massachusetts/i);
});

test("Local photography and the map are transparent, compact and usable", () => {
  assert.match(directory, /curatedPhotos/);
  assert.match(directory, /styles\.photoPick/);
  assert.match(directory, /styles\.mapDot/);
  assert.match(directory, /aria-pressed/);
  assert.match(directory, /google\.com\/maps\/search/);
  assert.doesNotMatch(directory, /tile\.openstreetmap|arcgisonline|<iframe|srcDoc/);
});

test("Guest-facing live transit and events never expose backend terminology", () => {
  assert.doesNotMatch(rail, /PuddleJumper checked|PuddleJumper's verified|PJ's current feed|PJ's feed/);
  assert.doesNotMatch(events, /PJ brings together|PJ's event feed|PJ's current listing|Local events · PuddleJumper/);
  assert.match(rail, /train\.expected/);
  assert.match(rail, /Scheduled departure/);
  assert.match(events, /feed\?\.events/);
  assert.match(events, /City of Gardner calendar/);
});
