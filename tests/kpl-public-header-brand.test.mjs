import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("public nav uses the real Lodge seal and Lodge wordmark, without duck branding", () => {
  const brand = read("app/_components/Brand.tsx");
  const shell = read("app/_components/ExperienceShell.tsx");
  assert.match(brand, /lodge-seal\.png/);
  assert.match(brand, /The Lodge/);
  assert.match(brand, /at Kendall Pond/);
  assert.match(brand, /by PublicLogic/);
  assert.match(shell, /<Brand header \/>/);
  assert.doesNotMatch(brand, /duck|mallard/i);
});

test("the header keeps responsive menu, book action and readable hero contrast", () => {
  const shell = read("app/_components/ExperienceShell.tsx");
  const css = read("app/showcase.css");
  assert.match(shell, /hospitality-menu/);
  assert.match(shell, /href=\{bookEnabled \? "\/book" : "\/rates"\}/);
  assert.match(css, /\.kpl-header-brand-copy/);
  assert.match(css, /hospitality-header-immersive:not\(\.hospitality-header-scrolled\) \.kpl-header-brand-copy/);
  assert.match(css, /@media \(max-width: 760px\)/);
});
