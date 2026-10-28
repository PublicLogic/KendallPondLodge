import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = p => readFileSync(new URL("../"+p, import.meta.url), "utf8");

test("home gives the kitchen its own sales card", () => {
  const home = read("app/page.tsx");
  assert.match(home, /photo:\s*17/);
  assert.match(home, /Cook together\./);
  assert.match(home, /Full kitchen/);
});

test("the Lodge makes kitchen and dining at least as prominent as the great room", () => {
  const lodge = read("app/lodge/page.tsx");
  const css = read("app/lodge/lodge.module.css");
  assert.match(lodge, /caption="Kitchen & dining"/);
  assert.match(css, /\.livingGrid\s*\{[^}]*grid-template-columns:1fr 1\.25fr/s);
});

test("wedding stays visually includes the kitchen again", () => {
  const events = read("app/events/page.tsx");
  assert.match(events, /19-kendall-pond-lodge-dining-room-and-kitchen\.jpg/);
  assert.match(events, /Kitchen & dining/);
});
