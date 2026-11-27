import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const hero = readFileSync(new URL("../app/_components/RetreatHero.tsx", import.meta.url), "utf8");

test("homepage hero offers the full-resolution waterfront photo", () => {
  const scenes = home.slice(home.indexOf("const heroScenes"), home.indexOf("const house"));
  assert.match(scenes, /lodgePhoto\(46\)/);
  assert.doesNotMatch(scenes, /golden-mist-sunrise/);
  assert.match(home, /lodgePhoto\(1\), label: "The lodge"/);
});
