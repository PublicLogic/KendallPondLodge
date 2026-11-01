import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = p => readFileSync(new URL("../"+p, import.meta.url), "utf8");

test("owner instant mode uses a four-stage CRM workflow and hides routine manual quoting", () => {
  const page = read("app/owner/bookings/page.tsx");
  assert.match(page, /bookingClient/);
  assert.match(page, /instantEnabled/);
  assert.match(page, /\["New", "Ready", "Checkout", "Confirmed"\]/);
  assert.match(page, /Apply booking policy/);
  assert.match(page, /autoPriceRequest/);
  assert.match(page, /!instantEnabled &&/);
});

test("owner can recover a legacy New request by applying the governed policy", () => {
  const actions = read("app/owner/bookings/actions.ts");
  assert.match(actions, /export async function autoPriceRequest/);
  assert.match(actions, /bookingClient\(\)\.autoPrice\(id\)/);
  assert.match(actions, /status=auto-priced/);
});

test("instant owner rail uses four columns and attention stays compact until opened", () => {
  const page = read("app/owner/bookings/page.tsx");
  const css = read("app/a-plus.css");
  assert.match(page, /owner-booking-progress-instant/);
  assert.match(css, /\.owner-booking-progress-instant\s*\{[^}]*repeat\(4/m);
  assert.match(page, /<details className="owner-booking-attention owner-attention-crm"/);
  assert.match(page, /<summary className="owner-booking-section-head"/);
  assert.match(css, /\.owner-attention-crm>summary/);
});
