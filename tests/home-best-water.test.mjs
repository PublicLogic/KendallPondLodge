import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const hero = readFileSync(new URL("../app/_components/RetreatHero.tsx", import.meta.url), "utf8");

test("the homepage lead uses the golden mist sunrise photo", () => {
  const heroScenes = home.slice(home.indexOf("const heroScenes"), home.indexOf("const house"));
  assert.match(heroScenes, /kendall-pond-golden-mist-sunrise\.webp/);
  assert.doesNotMatch(heroScenes, /lodgePhoto\(2\)/);
  assert.match(hero, /Golden morning on the pond/);
});

test("hot tub and deck remain distinct supporting scenes", () => {
  assert.match(home, /lodgePhoto\(4\)/);
  assert.match(home, /kendall-pond-lodge-deck-lounge-autumn\.webp/);
});
