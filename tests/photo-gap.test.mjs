import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("Lodge page does not reuse a property photo source", () => {
  const page = source("app/lodge/page.tsx");
  const paths = [...page.matchAll(/(?:image|src)=["'](\/images\/kpl\/[^"']+)["']/g)].map((match) => match[1]);
  assert.ok(paths.length >= 6, "expected Lodge media set");
  assert.equal(new Set(paths).size, paths.length, `duplicate Lodge image source: ${paths.join(", ")}`);
});

test("Lodge setup visibly backs deck and hot-tub amenities", () => {
  const page = source("app/lodge/page.tsx");
  assert.match(page, /src="\/images\/kpl\/lodge-exterior\.jpg"/);
  assert.match(page, /title="Deck \+ walkout patio"/);
  assert.match(page, /src="\/images\/kpl\/hot-tub\.jpg"/);
  assert.match(page, /title="Hot tub"/);
});

test("public discovery pages end with the shared booking CTA", () => {
  for (const file of ["app/lodge/page.tsx", "app/grounds/page.tsx", "app/explore/page.tsx"]) {
    const page = source(file);
    assert.match(page, /<BookingCtaBand \/>/, `${file} is missing BookingCtaBand`);
  }
});

test("Guidebook access has no orphaned standalone access marker", () => {
  const page = source("app/guidebook/access/page.tsx");
  assert.doesNotMatch(page, /guide-access-mark/);
});
