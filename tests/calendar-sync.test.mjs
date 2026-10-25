import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("owner calendar sync requires an owner session and fresh Airbnb validation", () => {
  const action = read("app/owner/settings/actions.ts");
  assert.match(action, /verifyOwnerSessionToken/);
  assert.match(action, /fetchAirbnbIcs\(\{ fresh: true \}\)/);
  assert.match(action, /parseIcsEvents\(ics\)/);
  assert.match(action, /registerCalendar\(url\)/);
  assert.match(action, /contentStatus\(\)/);
});

test("owner settings exposes sync control without exposing the private calendar URL", () => {
  const page = read("app/owner/settings/page.tsx");
  assert.match(page, /action=\{syncAirbnbCalendar\}/);
  assert.match(page, />Sync Airbnb calendar</);
  assert.doesNotMatch(page, /airbnb\.com\/calendar\/ical/);
  assert.doesNotMatch(page, /KPL_AIRBNB_ICAL_URL\?\.trim\(\).*<\/dd>/s);
});
