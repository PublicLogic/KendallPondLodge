import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

const read = (file) =>
  fs.readFileSync(path.join(root, file), "utf8");

test("KPL brand metadata uses the canonical icon and share assets", () => {
  const layout = read("app/layout.tsx");
  const manifest = read("app/manifest.ts");

  for (const file of [
    "app/icon.png",
    "app/apple-icon.png",
    "app/favicon.ico",
    "app/opengraph-image.png",
    "app/twitter-image.png",
  ]) {
    assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
  }

  assert.match(layout, /\/favicon\.ico/);
  assert.match(layout, /\/icon\.png/);
  assert.match(layout, /\/apple-icon\.png/);
  assert.match(layout, /\/opengraph-image\.png/);
  assert.match(layout, /\/twitter-image\.png/);

  assert.doesNotMatch(
    layout,
    /openGraph[\s\S]*\/images\/kpl\/pond-seating\.jpg/,
  );

  assert.match(manifest, /src: "\/icon\.png"/);
});
