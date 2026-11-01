import assert from "node:assert/strict";
import test from "node:test";
import { guestPriceBreakdown } from "../lib/guest-price-breakdown.mjs";

test("cleaning is folded into stay; pet fee is a separate visible line", () => {
  const quote = {
    nightly_cents: 20000, cleaning_cents: 12000, pet_cents: 5000,
    tax_cents: 11000, other_cents: 6000, other_label: "Weekend rate adjustment",
    total_cents: 94000,
  };
  const price = guestPriceBreakdown(quote, 3);
  assert.equal(price.stay_cents, 78000);
  assert.equal(price.cleaning_included_cents, 12000);
  assert.equal(price.pet_cents, 5000);
  assert.equal(price.tax_cents, 11000);
  assert.equal(price.other_cents, 0);
  assert.equal(price.matches_total, true);
});

test("separate non-weekend extras stay visible while cleaning remains bundled", () => {
  const quote = {
    nightly_cents: 15000, cleaning_cents: 8000, pet_cents: 5000,
    tax_cents: 5000, other_cents: 2000, other_label: "Approved extra",
    total_cents: 50000,
  };
  const price = guestPriceBreakdown(quote, 2);
  assert.equal(price.stay_cents, 38000);
  assert.equal(price.other_cents, 2000);
  assert.equal(price.other_label, "Approved extra");
  assert.equal(price.matches_total, true);
});

test("a price mismatch fails the guest checkout display gate", () => {
  const quote = {
    nightly_cents: 15000, cleaning_cents: 8000, pet_cents: 5000,
    tax_cents: 5000, other_cents: 0, other_label: null,
    total_cents: 90000,
  };
  assert.equal(guestPriceBreakdown(quote, 2).matches_total, false);
  const page = (await import("node:fs")).readFileSync(new URL("../app/book/quote/[token]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /price\.matches_total && open/);
  assert.match(page, /cleaning included/);
  assert.doesNotMatch(page, /<dt>Cleaning<\/dt>/);
  assert.match(page, /Pets ·/);
});
