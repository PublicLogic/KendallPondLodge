import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = p => readFileSync(new URL("../"+p, import.meta.url), "utf8");

test("instant guest flow says book and review price, not request a quote", () => {
  const form = read("app/book/StayRequestForm.tsx");
  const page = read("app/book/page.tsx");
  assert.match(form, /instant\?: boolean/);
  assert.match(form, /See price & book/);
  assert.match(form, /Checking price/);
  assert.match(page, /instant=\{instant\}/);
});

test("private price page is presented as booking review, not an owner quote", () => {
  const page = read("app/book/quote/[token]/page.tsx");
  assert.match(page, /Complete your booking/);
  assert.match(page, /Your complete price/);
  assert.doesNotMatch(page, /Private direct booking quote|This quote is for the dates above only/);
});

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
