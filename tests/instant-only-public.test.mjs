import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const page = readFileSync(new URL("../app/book/page.tsx", import.meta.url), "utf8");

test("public direct booking does not fall back to manual quote requests", () => {
  assert.match(page, /const bookable = enabled && instant/);
  assert.match(page, /Direct reservations aren’t open here yet/);
  assert.match(page, /bookable \? \(/);
  assert.doesNotMatch(page, /send the full quote|request a manual quote|instant \? "Coffee on the deck/i);
});
