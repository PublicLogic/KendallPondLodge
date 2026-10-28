import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = path => readFileSync(new URL("../"+path, import.meta.url), "utf8");

test("homepage hero uses distinct still photography without player chrome", () => {
  const home = read("app/page.tsx");
  const hero = read("app/_components/RetreatHero.tsx");
  assert.match(home, /lodgePhoto\(2\)/);
  assert.match(home, /lodgePhoto\(4\)/);
  assert.match(home, /kendall-pond-lodge-deck-lounge-autumn\.webp/);
  assert.doesNotMatch(home + hero, /<video|videoSrc:|controls=/);
});

test("the Lodge shows the downstairs and upgrades the outside image", () => {
  const lodge = read("app/lodge/page.tsx");
  assert.match(lodge, /downstairs:\s*lodgePhoto\(13\)/);
  assert.match(lodge, /grounds:\s*lodgePhoto\(6\)/);
  assert.match(lodge, /id="downstairs"/);
  assert.match(lodge, /href="#downstairs"/);
  assert.match(lodge, /Downstairs/);
  assert.match(lodge, /walkout patio/i);
});
