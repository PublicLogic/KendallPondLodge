import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL("../"+path, import.meta.url), "utf8");
const pages = {
  home: read("app/page.tsx"),
  area: read("app/area/page.tsx"),
  events: read("app/events/page.tsx"),
  explore: read("app/explore/page.tsx"),
  grounds: read("app/grounds/page.tsx"),
  rates: read("app/rates/page.tsx"),
  book: read("app/book/page.tsx"),
  photos: read("app/photos/page.tsx"),
  outside: read("app/outside/page.tsx"),
};
const all = Object.values(pages).join("\n");

test("premium photography is used across public marketing surfaces", () => {
  assert.match(pages.home, /lodgePhoto\(7\)/);
  assert.match(pages.area, /kendall-pond-lodge-autumn-lawn-premium\.webp/);
  assert.match(pages.events, /lodgePhoto\(7\)/);
  assert.match(pages.events, /19-kendall-pond-lodge-dining-room-and-kitchen\.jpg/);
  assert.match(pages.events, /lodgePhoto\(35\)/);
  assert.match(pages.explore, /lodgePhoto\(49\)/);
  assert.match(pages.explore, /lodgePhoto\(35\)/);
  assert.match(pages.grounds, /lodgePhoto\(50\)/);
  assert.match(pages.grounds, /lodgePhoto\(43\)/);
  assert.match(pages.grounds, /data-waterfront-cover/);
  assert.match(pages.rates, /lodgePhoto\(31\)/);
  assert.doesNotMatch(all, /kendall-pond-lodge-(deck-lounge-autumn|exterior-autumn)\.webp/);
  assert.match(pages.book, /data-booking-editorial/);
  assert.doesNotMatch(pages.book, /<Image|booking-intro-photo|data-retreat-hero/);
  assert.match(pages.photos, /lodgePhoto\(7\)/);
  assert.match(pages.photos, /lodgePhoto\(25\)/);
  assert.match(pages.outside, /kendall-pond-lodge-summer-lawn-premium\.webp/);
});

test("known weaker marketing images are no longer hard-coded on those pages", () => {
  for (const weak of [
    "03-kendall-pond-lodge-lakeview-deck.jpg",
    "07-kendall-pond-lodge-autumn-lodge-and-yard.jpg",
    "48-kendall-pond-lodge-autumn-lawn.jpg",
    "47-kendall-pond-lodge-late-autumn-firepit.jpg",
    "/images/kpl/firepit.jpg",
  ]) assert.ok(!all.includes(weak), "still using "+weak);
});
