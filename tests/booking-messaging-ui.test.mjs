import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("KPL uses PJ for quote delivery and exposes provider state", () => {
  const client = read("lib/pj-booking-client.mjs");
  const actions = read("app/owner/bookings/actions.ts");
  const owner = read("app/owner/bookings/page.tsx");
  const quoteActions = read("app/owner/bookings/QuoteLinkActions.tsx");

  assert.match(client, /messageStatus\(\)/);
  assert.match(client, /sendQuote\(id\)/);
  assert.match(actions, /export async function sendQuoteEmail/);
  assert.match(actions, /owner-blocked/);
  assert.match(owner, /bookingMessageStatus/);
  assert.match(owner, /Waiting for Airbnb block/);
  assert.match(owner, /quoteMessage/);
  assert.match(quoteActions, /Send quote/);
  assert.match(quoteActions, /accepted by email provider/);
  assert.doesNotMatch(quoteActions, /mailto:/);
});

test("confirmed guest experience shows payment result and Guidebook path", () => {
  const quote = read("app/book/quote/[token]/page.tsx");
  assert.match(quote, /You’re booked\./);
  assert.match(quote, /Open Guest Guide/);
  assert.match(quote, /Remaining balance:/);
});
