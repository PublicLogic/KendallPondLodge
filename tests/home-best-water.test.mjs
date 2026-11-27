import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const hero = readFileSync(new URL("../app/_components/RetreatHero.tsx", import.meta.url), "utf8");

test("the homepage opens on the lodge exterior and includes the pond", () => {
  const heroScenes = home.slice(home.indexOf("const heroScenes"), home.indexOf("const house"));
  assert.match(heroScenes, /lodgePhoto\(46\)/);
    assert.match(home, /lodgePhoto\(1\), label: "The lodge"/);
});

test("hot tub and deck remain distinct supporting scenes", () => {
  assert.match(home, /lodgePhoto\(4\)/);
  assert.match(home, /lodgePhoto\(35\)/);
});
