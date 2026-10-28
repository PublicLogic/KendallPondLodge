import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = path => readFileSync(new URL("../"+path, import.meta.url), "utf8");

test("deck motion behaves like a photograph, not a player", () => {
  const home = read("app/page.tsx");
  const hero = read("app/_components/RetreatHero.tsx");
  const css = read("app/_components/RetreatHero.module.css");
  assert.match(home, /kendall-pond-dawn-autumn\\.mp4/);
  assert.match(home, /kendall-pond-lodge-dawn-mist\\.webp/);
  assert.match(hero, /<LivingPhotoVideo/);
  assert.match(css, /\.motionVideo/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-width:\s*800px/);
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
