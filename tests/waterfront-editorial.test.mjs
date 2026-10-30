import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const page = read("app/grounds/page.tsx");
const css = read("app/grounds/grounds.module.css");
const shell = read("app/_components/ExperienceShell.tsx");
const manifest = JSON.parse(read("public/images/kpl/website-top-50/manifest.json"));

test("Waterfront opens with an authentic Lodge property image and existing visual identity", () => {
  assert.match(page, /data-waterfront-editorial/);
  assert.match(page, /data-waterfront-cover/);
  assert.match(page, /data-retreat-hero/);
  assert.match(page, /src=\{photos\.cover\.src\}/);
  assert.match(page, /alt=\{photos\.cover\.alt\}/);
  assert.match(page, /\bpriority\b/);
  assert.match(page, /sizes="100vw"/);
  assert.match(page, /grounds\.module\.css/);
  assert.match(css, /\.coverImage/);
  assert.match(css, /\.coverShade/);
  assert.match(css, /#213f32/);
  assert.match(css, /#f7f3eb/);
  assert.match(shell, /const onWaterfront = pathname === "\/grounds"/);
  assert.match(shell, /hasPhotoOpening = onHome \|\| onLodge \|\| onPhotos \|\| onWaterfront/);
  assert.match(shell, /new IntersectionObserver/);
});

test("The actual dock, deck, hot tub and firepit photographs are curated, unique and present", () => {
  const orders = [...page.matchAll(/lodgePhoto\((\d+)\)/g)].map((m) => Number(m[1]));
  assert.equal(orders.length, new Set(orders).size);
  for (const order of [50, 42, 43, 31, 4, 40, 6]) {
    assert.ok(orders.includes(order), "Missing photo " + order);
    const photo = manifest.photos.find((item) => item.order === order);
    assert.ok(photo, "Missing manifest entry " + order);
    assert.ok(existsSync(new URL("../public" + photo.src, import.meta.url)));
    assert.match(photo.src, /^\/images\/kpl\/(website-top-50|2026-10-28)\//);
  }
  assert.match(page, /<Photograph/);
  assert.match(page, /width=\{photo\.width\}/);
  assert.match(page, /height=\{photo\.height\}/);
  assert.match(page, /loading="lazy"/);
  assert.doesNotMatch(page, /<video|autoPlay|setInterval|\.mp4|unoptimized|unsplash|pexels/i);
});

test("Waterfront structure and seasonal caveats are legible and accurate", () => {
  for (const id of ["shoreline", "deck", "hot-tub", "firepit", "conditions"]) {
    assert.ok(page.includes('id="' + id + '"'), "Missing section " + id);
    assert.ok(page.includes('href="#' + id + '"'), "Missing jump link " + id);
  }
  assert.match(page, /private dock/i);
  assert.match(page, /kayaks/i);
  assert.match(page, /paddle boat/i);
  assert.match(page, /depend on the season and conditions/i);
  assert.match(page, /children and pets need close supervision/i);
  assert.match(page, /10 p\.m\. to 7 a\.m\./);
  assert.match(page, /PondScenery scene="waterfront"/);
  assert.doesNotMatch(page, /KP3|KP2|KENDALL-POND|pond-aerials/i);
  assert.match(page, /hostContactHref\(\)/);
  assert.match(css, /\.conditionsInner/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("Existing booking and guide links are retained without manual-quote promises", () => {
  assert.match(page, /directBookingEnabled/);
  assert.match(page, /directEnabled \? "\/book" : "\/rates"/);
  assert.match(page, /href=\{bookingHref\}/);
  assert.match(page, /href="\/lodge"/);
  assert.match(page, /href="\/photos"/);
  assert.match(page, /href="\/guidebook"/);
  assert.match(page, /review the full price and terms/i);
  assert.doesNotMatch(page, /send your dates|we.ll send.*quote|full quote before any charge/i);
});
