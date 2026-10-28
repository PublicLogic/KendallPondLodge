import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = p => readFileSync(new URL("../"+p, import.meta.url), "utf8");

test("home hero stays still and uses three distinct scenes", () => {
  const home = read("app/page.tsx");
  const hero = read("app/_components/RetreatHero.tsx");
  assert.match(home, /kendall-pond-golden-mist-sunrise\.webp/);
  assert.match(home, /lodgePhoto\(4\)/);
  assert.match(home, /kendall-pond-lodge-deck-lounge-autumn\.webp/);
  assert.doesNotMatch(home, /videoSrc:/);
  assert.doesNotMatch(hero, /LivingPhotoVideo|<video/);
});
