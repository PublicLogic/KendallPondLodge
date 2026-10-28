import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const hero = readFileSync(new URL("../app/_components/RetreatHero.tsx", import.meta.url), "utf8");
test("homepage is a sampler of sleep, yard and living space while keeping the pond-led header", () => {
  for (const photo of [25, 6, 17]) assert.ok(home.includes("photo: " + photo));
  assert.match(home, /The house\. The yard\. The pond\./);
  assert.match(home, /A whole house, right on the water\./);
  assert.match(home, /href: "\/lodge#sleeping"/);
  assert.match(home, /href: "\/grounds"/);
  assert.match(home, /href: "\/lodge#living"/);
  assert.match(hero, /Kendall Pond in fall/);
  assert.match(home, /lodgePhoto\(46\)/);
  assert.doesNotMatch(home + hero, /<iframe/);
});
test("homepage keeps booking and review surfaces intact", () => {
  assert.match(home, /<GuestReviewEvidence \/>/);
  assert.match(home, /\{enabled && <BookingSteps \/>\}/);
  assert.match(home, /<StayFAQ contactHref=\{hostContactHref\(\)\} \/>/);
  assert.match(home, /<BookingAction enabled=\{enabled\}/);
});
