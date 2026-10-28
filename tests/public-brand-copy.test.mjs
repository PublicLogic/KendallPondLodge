import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("guest footer and booking use STAY, while owner keeps Beta", () => {
  const footer = source("app/_components/ExperienceShell.tsx");
  const credit = source("app/_components/StayOsFooterMark.tsx");
  const booking = source("app/_components/BookingBrand.tsx");

  assert.match(footer, /<StayOsFooterMark inverse\s*\/>/);
  assert.match(credit, /brand\/stay\/puddlejumper-stay\.png/);
  assert.doesNotMatch(credit, /puddlejumper-beta\.png/);
  assert.match(credit, /By PublicLogic/);
  assert.match(booking, /owner\s*\?\s*"\/brand\/stay\/puddlejumper-beta\.png"/);
  assert.match(booking, /"\/brand\/stay\/puddlejumper-stay\.png"/);
});

test("guest copy clearly distinguishes instant booking from reservation truth", () => {
  const booking = source("app/book/page.tsx");
  const rates = source("app/_data/public-stay.json");
  const home = source("app/page.tsx");

  assert.match(booking, /Exact price and terms next|priced and held automatically|Instant direct booking is being set up/);
  assert.doesNotMatch(booking, /Start with your dates and we’ll send the full quote/);
  assert.match(rates, /not a reservation/);
  assert.match(home, /full price before asking for payment/);
});

test("public-facing pages omit removed generic marketing filler", () => {
  const pages = [
    "app/page.tsx",
    "app/photos/page.tsx",
    "app/lodge/page.tsx",
    "app/grounds/page.tsx",
    "app/explore/page.tsx",
    "app/area/page.tsx",
    "app/events/page.tsx",
  ];

  const combined = pages.map(source).join("\n").toLowerCase();
  const removedPhrases = [
    "a real place to make memories",
    "picture your days here",
    "the pond is the point",
    "make the weekend yours",
    "everything you need. nothing precious",
    "coffee by the pond beats a hotel lobby",
    "stay out after sunset",
    "no stock imagery",
  ];
  for (const phrase of removedPhrases) {
    assert.ok(!combined.includes(phrase), "Generic copy returned: " + phrase);
  }
});

test("homepage keeps the actual pond header and samples bedroom, yard and kitchen photographs", () => {
  const home = source("app/page.tsx");
  const hero = source("app/_components/RetreatHero.tsx");
  for (const photo of [25, 6, 17]) assert.ok(home.includes("photo: " + photo));
  for (const name of ["deck-lounge-autumn"]) {
    assert.ok(home.includes(`kendall-pond-lodge-${name}.webp`));
  }
  assert.match(home, /lodgePhoto\(space.photo\)/);
  assert.match(home, /lodgePhoto\(46\)/);
  assert.match(home, /const house = lodgePhoto\(7\)/);
  assert.doesNotMatch(home + hero, /<iframe/);
  assert.match(home, /<RetreatHero/);
  assert.match(hero, /priority/);
  assert.match(hero, /alt=\{scene.alt\}/);
});
