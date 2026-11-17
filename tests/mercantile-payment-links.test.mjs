import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {mercantilePaymentLinks,mercantileCategories} from "../lib/mercantile-payment-links.mjs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("all 11 paid Mercantile products have unique, verified-format Stripe links", () => {
  assert.equal(mercantilePaymentLinks.length, 11);
  assert.equal(new Set(mercantilePaymentLinks.map((p) => p.sku)).size, 11);
  assert.equal(new Set(mercantilePaymentLinks.map((p) => p.stripeUrl)).size, 11);
  assert.deepEqual(mercantileCategories.map((p) => p.key), ["Firewood", "Handmade", "Snacks"]);
  for (const item of mercantilePaymentLinks) {
    const url = new URL(item.stripeUrl);
    assert.equal(url.origin, "https://pay.publiclogic.org");
    assert.match(url.pathname, /^\/b\/[A-Za-z0-9]+$/);
    assert.match(item.sku, /^KPL-[A-Z0-9]+-\d{3}$/);
    assert.ok(Number.isSafeInteger(item.priceCents) && item.priceCents >= 100);
    assert.ok(item.name && item.description && item.category);
    assert.ok(mercantileCategories.some((category) => category.key === item.category));
  }
});

test("the approved prices match the verified live payment catalog", () => {
  assert.deepEqual(Object.fromEntries(mercantilePaymentLinks.map((p) => [p.sku,p.priceCents])), {
    "KPL-WOOD-001": 1000,
    "KPL-CRAFT-001": 2000,
    "KPL-HAT-001": 1200,
    "KPL-MITT-001": 1200,
    "KPL-SET-001": 2000,
    "KPL-SLIP-001": 800,
    "KPL-CANDY-001": 100,
    "KPL-COOKIE-001": 125,
    "KPL-CHIP-001": 150,
    "KPL-CANDY-002": 175,
    "KPL-SNACK-002": 225,
  });
});

test("preview checkout is disabled and the owner screen requires authentication", () => {
  const guest = read("app/store/page.tsx");
  const owner = read("app/owner/store/page.tsx");
  assert.match(guest, /process\.env\.VERCEL_ENV === "production"/);
  assert.match(guest, /if \(!enabled\)/);
  assert.match(guest, /href=\{item\.stripeUrl\}/);
  assert.match(owner, /await requireKplOwner\("\/owner\/store"\)/);
  assert.match(owner, /process\.env\.VERCEL_ENV === "production"/);
});

test("Mercantile mirrors the Lodge's actual editorial and photographic rhythm", () => {
  const guest = read("app/store/page.tsx");
  const css = read("app/store/mercantile.module.css");
  assert.match(guest, /data-mercantile-editorial/);
  assert.match(guest, /lodgePhoto\(5\)/);
  assert.match(guest, /lodgePhoto\(40\)/);
  assert.match(guest, /id="firewood"/);
  assert.match(guest, /id="handmade"/);
  assert.match(guest, /id="snacks"/);
  assert.match(css, /var\(--font-serif\)/);
  assert.doesNotMatch(guest, /kpl-store-emoji|item\.emoji/);
});

test("link checkout never claims inventory tracking and both desks link to the store", () => {
  assert.match(read("app/store/page.tsx"), /If you don&apos;t see it/);
  assert.match(read("app/owner/store/page.tsx"), /do not create PuddleJumper orders/);
  assert.match(read("app/_data/navigation.ts"), /href: "\/store"/);
  assert.match(read("app/owner/page.tsx"), /href="\/owner\/store"/);
});
