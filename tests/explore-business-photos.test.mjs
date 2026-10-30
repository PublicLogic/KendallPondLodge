import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const data = read("app/explore/guide-data.ts");
const directory = read("app/explore/ExploreDirectory.tsx");
const css = read("app/explore/explore.module.css");
const page = read("app/explore/page.tsx");

test("Every local Explore pick has a real, attributed photograph with a link to its source", () => {
  const slugs = [...data.matchAll(/^\s+slug: "([^"]+)",/gm)].map((match) => match[1]);
  const photos = [...data.matchAll(/^\s+image: \{\s*$/gm)];
  const sources = [...data.matchAll(/^\s+sourceUrl: "([^"]+)",/gm)].map((match) => match[1]);
  const credits = [...data.matchAll(/^\s+credit: "([^"]+)",/gm)].map((match) => match[1]);
  const mapsQueries = [...data.matchAll(/^\s+mapsQuery: "([^"]+)",/gm)].map((match) => match[1]);
  const alts = [...data.matchAll(/^\s+alt: "([^"]+)",/gm)].map((match) => match[1]);
  const urls = [...data.matchAll(/^\s+src: "(https:\/\/[^"]+)",/gm)].map((match) => match[1]);

  assert.equal(slugs.length, 11);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const [label, list] of Object.entries({ photos, sources, credits, mapsQueries, alts, urls })) {
    assert.equal(list.length, slugs.length, label + " missing for a place");
  }
  for (const item of [...sources, ...urls]) {
    const u = new URL(item);
    assert.equal(u.protocol, "https:");
    assert.ok(!u.username && !u.password);
    assert.ok(!u.hostname.includes("unsplash") && !u.hostname.includes("pexels"));
  }
  assert.ok(alts.every((alt) => alt.length > 20));
  assert.ok(credits.every(Boolean));
  assert.ok(mapsQueries.every((query) => query.includes("MA")));
  assert.match(data, /url: "https:\/\/www\.sawaasianma\.com\/"/);
  assert.doesNotMatch(data, /url: "https:\/\/www\.sawaasiancuisine\.com\/"/);
});

test("Business photos link to the correct venues and preserve their source attribution", () => {
  assert.match(directory, /function PlacePhoto/);
  assert.match(directory, /<figure className=\{styles\.placeFigure\}>/);
  assert.match(directory, /href=\{place\.url\}/);
  assert.match(directory, /src=\{place\.image\.src\}/);
  assert.match(directory, /alt=\{place\.image\.alt\}/);
  assert.match(directory, /loading="lazy"/);
  assert.match(directory, /decoding="async"/);
  assert.match(directory, /referrerPolicy="no-referrer"/);
  assert.match(directory, /onError=\{\(\) => setImageAvailable\(false\)\}/);
  assert.match(directory, /href=\{place\.image\.sourceUrl\}/);
  assert.match(directory, /place\.image\.credit/);
  assert.match(directory, /Photo unavailable/);
  assert.match(directory, /https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
  assert.match(directory, /encodeURIComponent\(place\.mapsQuery\)/);
  assert.match(directory, /on Google Maps/);
  assert.match(directory, /rel="noopener noreferrer"/);
});

test("Explore image layout stays restrained, responsive and unconnected to private PJ operations", () => {
  assert.match(css, /\.placeImage\s*\{/);
  assert.match(css, /aspect-ratio: 16 \/ 10/);
  assert.match(css, /\.placeImageCredit/);
  assert.match(css, /\.pickActions/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(page, /<ExploreDirectory \/>/);
  assert.match(page, /loadPjExplore/);
  assert.doesNotMatch(directory + data, /KPL_STORE_KEY|STRIPE_SECRET_KEY|api-v3\.mbta\.com|calendar-source/);
  assert.doesNotMatch(directory, /setInterval|autoplay|onMouseOver=/);
});
