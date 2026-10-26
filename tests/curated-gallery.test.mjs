import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const manifestUrl = new URL(
  "../public/images/kpl/website-top-50/manifest.json",
  import.meta.url,
);
const manifest = JSON.parse(readFileSync(manifestUrl, "utf8"));

test("the guest gallery uses 50 real, public-safe property photographs", () => {
  assert.equal(manifest.photos.length, 50);
  const paths = new Set();
  const orders = new Set();

  for (const photo of manifest.photos) {
    assert.match(photo.src, /^\/images\/kpl\/website-top-50\//);
    assert.match(photo.src, /\.jpg$/);
    assert.equal(typeof photo.alt, "string");
    assert.ok(photo.alt.trim().length >= 12);
    assert.ok(photo.width >= 800 && photo.height >= 800);
    assert.ok(!paths.has(photo.src), "Duplicate photo path: " + photo.src);
    assert.ok(!orders.has(photo.order), "Duplicate photo order: " + photo.order);

    paths.add(photo.src);
    orders.add(photo.order);

    const diskPath = new URL("../public" + photo.src, import.meta.url);
    assert.ok(existsSync(diskPath), "Missing file: " + photo.src);
  }

  assert.deepEqual([...orders].sort((a, b) => a - b), Array.from({ length: 50 }, (_, i) => i + 1));
  assert.equal(manifest.photos[0].category, "01-Hero");
});
