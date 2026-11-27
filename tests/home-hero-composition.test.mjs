import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = p => readFileSync(new URL("../"+p, import.meta.url), "utf8");

test("home hero uses four distinct property scenes with no repeated pond frame", () => {
  const home = read("app/page.tsx");
  const hero = read("app/_components/RetreatHero.tsx");
  assert.match(home, /lodgePhoto\(46\)/);
  assert.match(home, /lodgePhoto\(4\)/);
  assert.match(home, /lodgePhoto\(35\)/);
  assert.doesNotMatch(home, /videoSrc:/);
  assert.doesNotMatch(hero, /LivingPhotoVideo|<video/);
  assert.match(home, /lodgePhoto\(1\), label: "The lodge"/);
  assert.match(home, /label: "Upper deck"/);
});

test("the old dawn mist is not repeated in the hero", () => {
  const home = read("app/page.tsx");
  const heroSection = home.slice(home.indexOf("const heroScenes"), home.indexOf("const house"));
  assert.equal((heroSection.match(/dawn-mist/g) || []).length, 0);
});
