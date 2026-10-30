import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

const home = read("app/_components/RetreatHero.tsx");
const lodge = read("app/lodge/page.tsx");
const photos = read("app/photos/page.tsx");
const waterfront = read("app/grounds/page.tsx");
const explore = read("app/explore/page.tsx");
const book = read("app/book/page.tsx");
const bookCss = read("app/book/book.module.css");
const shell = read("app/_components/ExperienceShell.tsx");

test("Main property pages have distinct headlines, not repeated pond slogans", () => {
  assert.match(home, /<span>Down by<\/span>\s*<span>the pond\.<\/span>/);
  assert.match(lodge, /The house<br \/><em>is yours\.<\/em>/);
  assert.match(photos, /See it<br \/><em>for yourself\.<\/em>/);
  assert.match(waterfront, /From the deck<br \/><em>to the dock\.<\/em>/);
  assert.match(explore, /<h1 id="explore-title">Worth leaving the dock for\.<\/h1>/);

  for (const source of [home, lodge, photos, waterfront]) {
    assert.doesNotMatch(source, /Got a few nights|Got a weekend in mind\?/);
  }
  assert.doesNotMatch([home,lodge,photos,waterfront].join("\n"),
    /the pond is the point|make the weekend yours|a real place to make memories/i);
});

test("Book page is task-first, not a fifth full-photo header", () => {
  assert.match(book, /<h1 id="booking-title">Book the Lodge\.<\/h1>/);
  assert.match(book, /data-booking-editorial/);
  assert.match(book, /book\.module\.css/);
  assert.match(book, /styles\.frame/);
  assert.match(book, /styles\.panel/);
  assert.match(book, /Choose your nights\./);
  assert.doesNotMatch(book, /<Image|booking-intro-photo|data-retreat-hero|A stay worth slowing down for/);
  assert.match(bookCss, /grid-template-columns: minmax\(280px, .68fr\) minmax\(0, 1.32fr\)/);
  assert.match(bookCss, /@media \(max-width: 700px\)/);
  assert.match(bookCss, /prefers-reduced-motion: reduce/);
  // The public header's photo-overlay route list remains unchanged.
  assert.match(shell, /hasPhotoOpening = onHome \|\| onLodge \|\| onPhotos \|\| onWaterfront/);
  assert.doesNotMatch(shell, /onBook|pathname === "\/book"/);
});

test("Calendar-first booking keeps live guards, accurate fallback and Stripe path", () => {
  assert.match(book, /const bookable = enabled && instant/);
  assert.match(book, /fetchAirbnbIcs\(\{ fresh: true \}\)/);
  assert.match(book, /blockedNightsFromIcs\(ics\)/);
  assert.match(book, /bookingClient\(\)\.list\(100\)/);
  assert.match(book, /BLOCKING_DIRECT_STATUSES/);
  assert.match(book, /!bookable \? \(/);
  assert.match(book, /!availabilityReady \? \(/);
  assert.match(book, /action=\{requestStay\}/);
  assert.match(book, /instant=\{instant\}/);
  assert.match(book, /unavailableDates=\{\[\.\.\.unavailable\]\.sort\(\)\}/);
  assert.match(book, /<StayRequestForm/);
  assert.match(book, /href=\{airbnb\}/);
  assert.match(book, /Stripe/);
  assert.doesNotMatch(book, /send the full quote|direct date requests are temporarily paused\.\s*<\/p>\s*<\/div>\s*<StayRequestForm/);
});

test("Host voice keeps property facts and guest next steps legible", () => {
  assert.match(home, /three bedrooms|Three bedrooms/);
  assert.match(lodge, /room for eight/i);
  assert.match(waterfront, /private dock/i);
  assert.match(photos, /lodgePhotos\.length/);
  assert.match(book, /Up to 8/);
  assert.match(book, /3 bedrooms/);
  assert.match(book, /2 full baths/);
  assert.match(book, /Hosted by Nate &amp; Allie/);
  assert.match(book, /\/lodge/);
  assert.match(book, /\/grounds/);
  assert.match(book, /\/photos/);
});
