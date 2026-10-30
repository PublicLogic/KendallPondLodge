import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const page = read("app/explore/page.tsx");
const guide = read("app/explore/guide-data.ts");
const directory = read("app/explore/ExploreDirectory.tsx");
const rail = read("app/explore/WachusettRail.tsx");
const events = read("app/explore/CommunityEvents.tsx");
const styles = read("app/explore/explore.module.css");

test("Explore leads with Gardner and useful details, not a generic brand slogan", () => {
  assert.match(page, /<h1 id="explore-title">Worth leaving the dock for\.<\/h1>/);
  assert.match(page, /We live nearby/);
  assert.match(page, /Keep these handy/);
  assert.match(page, /Staying in works too/);
  assert.match(page, /Wachusett/);
  assert.match(page, /Cider donuts in Phillipston/);
  assert.doesNotMatch(page, /Cider donuts on the way back/);
  assert.match(page, /Chair City at/);
  assert.match(page, /href="#train"/);
  assert.match(page, /href="#city-events"/);
  assert.doesNotMatch(page, /When you feel|Pick a plan|Change it whenever|A shorter list, chosen with care|Good places to know|Not a ranking|The deck is still here|Ideas for a day out|Places around town|The Chamber directory/);
  assert.doesNotMatch(page, /Kendall Pond, when you get back/);
});

test("Day suggestions are named places, not numbered experiences", () => {
  assert.match(page, /A hike and a cider donut/);
  assert.match(page, /Blue Moon Diner/);
  assert.match(page, /Fitchburg Art Museum/);
  assert.doesNotMatch(page, /className=\{styles\.dayNumber\}|>01 <span|>02 <span|>03 <span/);
  assert.doesNotMatch(styles, /\.pickNumber/);
});

test("Local recommendations use facts instead of generic 'good choice' filler", () => {
  assert.match(guide, /Blue Moon Diner/);
  assert.match(guide, /Gardner Ale House/);
  assert.match(guide, /Red Apple Farm/);
  assert.match(guide, /Coffee and breakfast on Chestnut Street/);
  assert.match(guide, /Pub food and Moon Hill beer on Parker Street/);
  assert.doesNotMatch(guide, /Snow report first, plans second|Trail shoes and summit views/);
  assert.doesNotMatch(guide, /Good choice when|An easy stop|A useful choice|A strong indoor choice|A simple movie-night option|The outing can be as simple/);
  assert.doesNotMatch(directory, /styles\.pickNumber|String\(index \+ 1\)/);
  assert.match(directory, /aria-pressed/);
  assert.match(directory, /place\.location/);
});

test("Guest-facing transit and event messages do not mention platform plumbing", () => {
  assert.doesNotMatch(rail, /PuddleJumper checked|PuddleJumper's verified|PJ's current feed|PJ's feed/);
  assert.doesNotMatch(events, /PJ brings together|PJ's event feed|PJ's current listing|Local events · PuddleJumper/);
  assert.match(rail, /train\.expected/);
  assert.match(rail, /Scheduled departure/);
  assert.match(events, /feed\?\.events/);
  assert.match(events, /City of Gardner calendar/);
});
