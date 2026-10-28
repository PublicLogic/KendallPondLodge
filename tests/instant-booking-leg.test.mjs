import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = p => readFileSync(new URL("../"+p, import.meta.url), "utf8");

test("KPL exposes a private Airbnb-import calendar backed by PJ holds", () => {
  const route = read("app/calendar/[token]/route.ts");
  const cal = read("lib/direct-calendar.mjs");
  assert.match(route, /KPL_AIRBNB_IMPORT_TOKEN/);
  assert.match(route, /bookingClient\(\)\.list\(100\)/);
  assert.match(route, /text\/calendar/);
  assert.match(route, /no-store/);
  assert.match(cal, /quoted/);
  assert.match(cal, /checkout/);
  assert.match(cal, /confirmed/);
  assert.doesNotMatch(cal, /guest_name|guest_email/);
  assert.match(cal, /BEGIN:VEVENT/);
  assert.match(cal, /VALUE=DATE/);
});

test("KPL client understands PJ instant-booking settings and auto-price", () => {
  const client = read("lib/pj-booking-client.mjs");
  assert.match(client, /instantSettings\(\)/);
  assert.match(client, /updateInstantSettings\(settings\)/);
  assert.match(client, /autoPrice\(id\)/);
});

test("public submission automatically prices when PJ instant booking is active", () => {
  const actions = read("app/book/actions.ts");
  assert.match(actions, /instantSettings/);
  assert.match(actions, /autoPrice/);
  assert.match(actions, /book\/quote/);
});

test("owner booking queue is CRM-like and compact", () => {
  const page = read("app/owner/bookings/page.tsx");
  const css = read("app/a-plus.css");
  assert.match(page, /<details/);
  assert.match(page, /<summary className="owner-booking-card-head"/);
  assert.match(page, /owner-booking-counts/);
  assert.doesNotMatch(page, /className="owner-booking-summary"/);
  assert.match(css, /\.owner-booking-card>summary/);
  assert.match(css, /\.owner-booking-card\[open\]/);
});

test("owner settings shows instant booking and Airbnb outbound calendar", () => {
  const settings = read("app/owner/settings/page.tsx");
  assert.match(settings, /Instant booking/);
  assert.match(settings, /Airbnb import calendar/);
  assert.match(settings, /instantSettings/);
});
