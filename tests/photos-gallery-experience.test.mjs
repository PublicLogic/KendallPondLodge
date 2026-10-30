import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const page = read("app/photos/page.tsx");
const css = read("app/photos/photos.module.css");
const shell = read("app/_components/ExperienceShell.tsx");
const gallery = read("app/_components/LodgePhotoGallery.tsx");
const manifest = JSON.parse(read("public/images/kpl/website-top-50/manifest.json"));

test("Photos opens with Lodge photography, the same header, and the original palette", () => {
  assert.match(page, /data-lodge-photos/);
  assert.match(page, /data-gallery-cover/);
  assert.match(page, /data-retreat-hero/);
  assert.match(page, /lodgePhoto\(35\)/);
  assert.match(page, /lodgePhoto\(7\)/);
  assert.match(page, /lodgePhoto\(25\)/);
  assert.match(page, /lodgePhoto\(4\)/);
  assert.match(page, /coverPhoto\.alt/);
  assert.match(page, /priority/);
  assert.match(shell, /const onPhotos = pathname === "\/photos"/);
  assert.match(shell, /const hasPhotoOpening = onHome \|\| onLodge \|\| onPhotos/);
  assert.match(css, /#213f32/);
  assert.match(css, /#f7f3eb/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(page, /KP3|KP2|KENDALL-POND|pond-aerials|unsplash|pexels|autoPlay|<video|<iframe/i);
});

test("Photos keeps all 50 curated photos, with clear room filters and useful descriptions", () => {
  assert.equal(manifest.photos.length, 50);
  assert.match(page, /<LodgePhotoGallery \/>/);
  assert.match(page, /id="all-photos"/);
  assert.match(page, /lodgePhotos\.length/);
  assert.match(gallery, /photoFilters\.map/);
  assert.match(gallery, /aria-pressed=\{selected\}/);
  assert.match(gallery, /aria-controls="lodge-gallery-grid"/);
  assert.match(gallery, /role="status"/);
  assert.match(gallery, /gallery-filter-count/);
  assert.match(gallery, /photo\.alt/);
  assert.match(gallery, /loading="lazy"/);
  assert.match(css, /\.collection :global\(\.gallery-grid\)/);
  assert.match(css, /max-width: 560px/);
});

test("Full-screen viewer supports keyboard, swipes, Escape, and focus restoration", () => {
  assert.match(gallery, /<dialog/);
  assert.match(gallery, /showModal\(\)/);
  assert.match(gallery, /close\(\)/);
  assert.match(gallery, /ArrowLeft/);
  assert.match(gallery, /ArrowRight/);
  assert.match(gallery, /onTouchStart/);
  assert.match(gallery, /onTouchEnd/);
  assert.match(gallery, /onTouchCancel/);
  assert.match(gallery, /Math\.abs\(deltaX\) < 60/);
  assert.match(gallery, /lastTrigger\.current\?\.focus\(\)/);
  assert.match(gallery, /aria-live="polite"/);
  assert.match(css, /touch-action: pan-y/);
});

test("Photos retains direct-booking and Airbnb fallbacks without old quote promises", () => {
  assert.match(page, /directBookingEnabled/);
  assert.match(page, /href="\/book"/);
  assert.match(page, /href=\{airbnb\}/);
  assert.match(page, /href="\/guidebook"/);
  assert.match(page, /href="\/lodge#sleeping"/);
  assert.match(page, /href="\/grounds"/);
  assert.match(page, /review the full price and terms/);
  assert.doesNotMatch(page, /we.ll check availability|send us your dates|full quote before any charge|guaranteed/i);
});
