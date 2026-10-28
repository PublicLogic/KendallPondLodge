import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const page = readFileSync(new URL("../app/book/page.tsx", import.meta.url), "utf8");

test("public direct booking does not fall back to manual quote requests", () => {
  assert.match(page, /const bookable = enabled && instant/);
  assert.match(page, /Instant direct booking is being set up/);
  assert.match(page, /bookable \? \(/);
  assert.doesNotMatch(page, /instant \? "Coffee on the deck/);
});
