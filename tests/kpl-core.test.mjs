import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { AUDIO_HELP, audioStatus, parseAudioCommand } from "../lib/audio.mjs";
import { GUIDE_ENTRIES, searchGuide } from "../lib/kendall.mjs";
import {
  GuidebookConfigError,
  hashGuestCode,
  verifyGuestCode,
  verifySessionToken,
} from "../lib/guidebook-auth.mjs";

// fileURLToPath (not `new URL(...).pathname`) so this also works on paths
// containing spaces or parentheses, which would otherwise stay percent-encoded.
const root = fileURLToPath(new URL("..", import.meta.url));

function guidebookRoutePath(route) {
  const grouped = join(root, "app", "guidebook", "(dashboard)", route, "page.tsx");
  const legacy = join(root, "app", "guidebook", route, "page.tsx");
  return existsSync(grouped) ? grouped : legacy;
}

function guidebookRootPath() {
  const grouped = join(root, "app", "guidebook", "(dashboard)", "page.tsx");
  const legacy = join(root, "app", "guidebook", "page.tsx");
  return existsSync(grouped) ? grouped : legacy;
}

test("Ask Kendall stays inside the coded Guidebook", () => {
  assert.equal(searchGuide("How do I use the hot tub?").href, "/guidebook/outside#hot-tub");
  assert.equal(searchGuide("Where is the wifi password?").href, "/guidebook/house");
  assert.equal(searchGuide("Can I pair the house speaker?").href, "/guidebook/audio");
  assert.equal(searchGuide("What do I do before checkout?").href, "/guidebook/checkout");
  assert.equal(searchGuide("Tell me about quantum mechanics").kind, "fallback");
  assert.ok(GUIDE_ENTRIES.length >= 12);
  assert.ok(GUIDE_ENTRIES.every((entry) => entry.href.startsWith("/guidebook")));
});

test("audio command parser keeps the CLI small and predictable", () => {
  assert.deepEqual(parseAudioCommand("volume 42"), { type: "command", name: "volume", level: 42 });
  assert.deepEqual(parseAudioCommand("pair"), { type: "command", name: "speaker" });
  assert.equal(parseAudioCommand("volume 101").type, "error");
  assert.equal(parseAudioCommand("unlock").type, "error");
  assert.match(AUDIO_HELP, /speaker/);
  assert.equal(audioStatus({ fileName: "pond.mp3", outputName: "Echo", paused: false, volume: 0.5 }), "Playing · 50% · Echo · pond.mp3");
});

test("Booking, Guidebook, legacy routes, and real property photos exist", () => {
  const routes = ["arrival", "house", "waterfront", "outside", "audio", "checkout", "help", "guidebook"];
  for (const route of routes) {
    if (route === "guidebook") assert.ok(existsSync(guidebookRootPath()), "missing /guidebook");
    else assert.ok(existsSync(join(root, "app", route, "page.tsx")), `missing /${route}`);
  }
  assert.ok(existsSync(join(root, "app", "page.tsx")), "missing home page (Booking)");

  const guideRoutes = ["arrival", "house", "waterfront", "outside", "audio", "checkout", "access"];
  for (const route of guideRoutes) {
    const path = route === "access" ? join(root, "app", "guidebook", route, "page.tsx") : guidebookRoutePath(route);
    assert.ok(existsSync(path), `missing /guidebook/${route}`);
  }

  const photos = ["pond.jpg", "lodge-exterior.jpg", "great-room.jpg", "kitchen-dining.jpg", "king-room.jpg", "queen-room.jpg", "bunk-room.jpg", "pond-seating.jpg", "hot-tub.jpg", "firepit.jpg", "Stay.OS.PNG"];
  for (const photo of photos) assert.ok(existsSync(join(root, "public", "images", "kpl", photo)), `missing ${photo}`);
});

test("Approved PJ identity is shared across every footer shell", () => {
  const mark = readFileSync(join(root, "app/_components/StayOsFooterMark.tsx"), "utf8");
  const guidebookFooter = readFileSync(join(root, "app/_components/SiteFooter.tsx"), "utf8");
  const experienceShell = readFileSync(join(root, "app/_components/ExperienceShell.tsx"), "utf8");

  assert.match(mark, /puddlejumper-stay\.png/);
  assert.doesNotMatch(mark, /puddlejumper-beta\.png/);
  assert.match(mark, /By PublicLogic/);
  assert.match(mark, /next\/image/);
  assert.match(guidebookFooter, /StayOsFooterMark/);
  assert.match(experienceShell, /StayOsFooterMark inverse/);
});

test("Guidebook access is server-enforced and does not publish the plaintext code", () => {
  const proxy = readFileSync(join(root, "proxy.ts"), "utf8");
  const action = readFileSync(join(root, "app/guidebook/access/actions.ts"), "utf8");
  const auth = readFileSync(join(root, "lib/guidebook-auth.mjs"), "utf8");
  assert.match(proxy, /GUIDEBOOK_COOKIE_NAME/);
  assert.match(proxy, /\/guidebook\/access/);
  assert.match(auth, /kpl-guidebook-session/);
  assert.match(auth, /timingSafeEqual/);
  assert.match(action, /verifyGuestCode/);
  assert.doesNotMatch(`${proxy}\n${action}\n${auth}`, /97N8KPL/);
});

test("Guidebook auth fails closed instead of falling back to a public default in production", () => {
  const auth = readFileSync(join(root, "lib/guidebook-auth.mjs"), "utf8");
  const proxy = readFileSync(join(root, "proxy.ts"), "utf8");
  assert.match(auth, /GuidebookConfigError/);
  assert.match(auth, /isProduction/);
  // Confirms production never silently falls back to the checked-in dev value.
  assert.match(auth, /if \(isProduction\(\)\) throw new GuidebookConfigError/);
  assert.match(proxy, /GuidebookConfigError/);
  assert.match(proxy, /503/);
});

test("Guidebook auth behaves correctly at runtime for both dev and production", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalCodeHash = process.env.KPL_GUIDEBOOK_CODE_HASH;
  const originalSessionToken = process.env.KPL_GUIDEBOOK_SESSION_TOKEN;

  try {
    // In development, without any env vars configured, the dev-only default is usable.
    delete process.env.KPL_GUIDEBOOK_CODE_HASH;
    delete process.env.KPL_GUIDEBOOK_SESSION_TOKEN;
    process.env.NODE_ENV = "development";
    assert.equal(verifySessionToken("not-the-token"), false);

    // In production, missing secrets must fail closed (throw), not fall back.
    process.env.NODE_ENV = "production";
    assert.throws(() => verifyGuestCode("ANYCODE"), GuidebookConfigError);
    assert.throws(() => verifySessionToken("anything"), GuidebookConfigError);

    // Once configured, production works and only the correct value matches.
    const code = "STAY123";
    process.env.KPL_GUIDEBOOK_CODE_HASH = hashGuestCode(code);
    process.env.KPL_GUIDEBOOK_SESSION_TOKEN = "a-real-production-token";
    assert.equal(verifyGuestCode(code), true);
    assert.equal(verifyGuestCode("WRONGCODE"), false);
    assert.equal(verifySessionToken("a-real-production-token"), true);
    assert.equal(verifySessionToken("335e16d7cd40d0177b2b2038363b097a34148232b9b05210dfd15cba37e6fba6"), false);
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalCodeHash === undefined) delete process.env.KPL_GUIDEBOOK_CODE_HASH;
    else process.env.KPL_GUIDEBOOK_CODE_HASH = originalCodeHash;
    if (originalSessionToken === undefined) delete process.env.KPL_GUIDEBOOK_SESSION_TOKEN;
    else process.env.KPL_GUIDEBOOK_SESSION_TOKEN = originalSessionToken;
  }
});

test("Guidebook-facing source has no promotional or obvious private data", () => {
  const paths = [
    "app/guidebook/page.tsx",
    "app/arrival/page.tsx",
    "app/house/page.tsx",
    "app/waterfront/page.tsx",
    "app/outside/page.tsx",
    "app/audio/page.tsx",
    "app/checkout/page.tsx",
    "app/help/page.tsx",
    "lib/kendall.mjs",
  ];
  const resolved = paths.map((path) => (path === "app/guidebook/page.tsx" ? guidebookRootPath() : join(root, path)));
  const source = resolved.map((path) => readFileSync(path, "utf8")).join("\n");
  assert.doesNotMatch(source, /book now|nightly rate|five.star|reserve now|available dates/i);
  assert.doesNotMatch(source, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  assert.doesNotMatch(source, /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/);
  assert.doesNotMatch(source, /airbnb\.com|vrbo\.com/i);
});

test("capability boundary does not claim uninstalled device control", () => {
  const source = readFileSync(join(root, "app/api/capabilities/route.ts"), "utf8");
  assert.match(source, /not-installed/);
  assert.match(source, /storesQuestions: false/);
  assert.match(source, /uploadsGuestAudio: false/);
  assert.match(source, /simulatesDeviceState: false/);
});
