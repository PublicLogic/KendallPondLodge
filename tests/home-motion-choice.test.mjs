import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = p => readFileSync(new URL("../"+p, import.meta.url), "utf8");

test("home motion uses the calmer dawn pond clip at a slower rate", () => {
  const home = read("app/page.tsx");
  const hero = read("app/_components/RetreatHero.tsx");
  const motion = read("app/_components/LivingPhotoVideo.tsx");
  assert.match(home, /kendall-pond-dawn-autumn\.mp4/);
  assert.match(home, /kendall-pond-lodge-dawn-mist\.webp/);
  assert.doesNotMatch(home, /kendall-pond-deck-lounge-autumn\.mp4/);
  assert.match(hero, /<LivingPhotoVideo/);
  assert.match(motion, /playbackRate\s*=\s*0\.6/);
  assert.match(motion, /muted/);
  assert.match(motion, /loop/);
  assert.match(motion, /playsInline/);
  assert.doesNotMatch(motion, /controls/);
});

test("the motion tile is labeled as pond, not deck", () => {
  const hero = read("app/_components/RetreatHero.tsx");
  assert.match(hero, /Dawn on the pond/);
  assert.doesNotMatch(hero, /caption: "The upper deck"/);
});
