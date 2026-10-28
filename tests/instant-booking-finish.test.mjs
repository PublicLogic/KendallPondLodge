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
  assert.match(page, /Review & book your stay/);
  assert.match(page, /Complete price/);
  assert.doesNotMatch(page, /Private direct booking quote|This quote is for the dates above only/);
});

test("owner instant mode uses a four-stage CRM workflow and hides routine manual quoting", () => {
  const page = read("app/owner/bookings/page.tsx");
  assert.match(page, /bookingClient/);
  assert.match(page, /instantEnabled/);
  assert.match(page, /\["New", "Held", "Paying", "Confirmed"\]/);
  assert.match(page, /Apply booking policy/);
  assert.match(page, /autoPriceRequest/);
  assert.match(page, /!instantEnabled &&/);
});

test("owner can recover a legacy New request by applying the governed policy", () => {
  const actions = read("app/owner/bookings/actions.ts");
  assert.match(actions, /export async function¶»§q«^