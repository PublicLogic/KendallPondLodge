import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("homepage has the new Lodge identity and real curated photography", () => {
  const home = source("app/page.tsx");
  assert.match(home, /Bring the crew\./);
  assert.match(home, /We've got the pond\./);
  assert.match(home, /The Lodge at Kendall Pond/);
  assert.match(home, /lodgePhoto\(1\)/);
  assert.match(home, /lodgePhoto\(3\)/);
  assert.match(home, /lodgePhoto\(46\)/);
  assert.match(home, /showcase-hero-postcard/);
  assert.match(home, /directBookingEnabled\(\)/);
  assert.match(home, /href="\/book"/);
  assert.match(home, /href=\{airbnb\}/);
  assert.match(home, /full price before asking for payment/);
});

test("the new styling remains scoped to guest-facing pages", () => {
  const css = source("app/pond-editorial.css");
  const layout = source("app/layout.tsx");

  assert.match(layout, /import "\.\/showcase\.css";\s*import "\.\/pond-editorial\.css";/);
  assert.match(css, /\.showcase-louder/);
  assert.match(css, /\.gallery-louder/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.showcase-hero-postcard/);
  assert.doesNotMatch(css, /\.owner-(?:page|console|settings)/);
});

test("STAY branding remains intact through the editorial redesign", () => {
  const footer = source("app/_components/ExperienceShell.tsx");
  const stay = source("app/_components/StayOsFooterMark.tsx");

  assert.match(footer, /<StayOsFooterMark inverse\s*\/>/);
  assert.match(stay, /brand\/stay\/puddlejumper-stay\.png/);
  assert.doesNotMatch(stay, /brand\/stay\/puddlejumper-beta\.png/);
});
