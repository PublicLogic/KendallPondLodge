import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

const read = (file) =>
  fs.readFileSync(path.join(root, file), "utf8");

test("public home is hospitality-first, not dashboard-first", () => {
  const home = read("app/page.tsx");
  const shell = read("app/_components/ExperienceShell.tsx");

  assert.match(home, /RetreatHero/);
  assert.match(home, /The Lodge at Kendall Pond/);
  assert.match(home, /GuestReviewEvidence/);

  assert.doesNotMatch(home, /PageHero/);
  assert.doesNotMatch(home, /StatBand/);
  assert.doesNotMatch(home, /Your place by the pond/);

  assert.match(shell, /hospitality-menu/);
  assert.doesNotMatch(shell, /PublicMobileNav/);
});

test("authenticated Guidebook owns the viewport", () => {
  const shell = read("app/_components/ExperienceShell.tsx");
  const guide = read("app/guidebook/(dashboard)/help/page.tsx");
  const dashboard = read("app/guidebook/_components/ControlDashboard.tsx");
  const css = read("app/guidebook/guestbook.css");
  const guideShell = read("app/guidebook/_components/GuidebookShell.tsx");

  assert.match(
    shell,
    /if \(isGuidebookAccess \|\| isGuidebook\)[\s\S]*return <>\{children\}<\/>/,
  );

  assert.match(dashboard, /The guestbook/);
  assert.match(dashboard, /Make yourself/);
  assert.match(guideShell, /GuestMusic/);
  assert.match(guide, /AskKendall embedded/);
  assert.match(css, /min-height: 100dvh/);
  assert.match(css, /\.gb-music-panel\.gb-player-floating/);

});

test("owner bookings expose the governed six-step workflow", () => {
  const page = read("app/owner/bookings/page.tsx");
  const actions = read("app/owner/bookings/QuoteLinkActions.tsx");

  for (const step of [
    '"New"',
    '"Quote"',
    '"Airbnb"',
    '"Send"',
    '"Paying"',
    '"Confirmed"',
  ]) {
    assert.match(page, new RegExp(step));
  }

  assert.match(page, /Waiting for Airbnb block/);
  assert.match(page, /QuoteLinkActions/);
  assert.match(page, /bookingMessageStatus/);

  assert.match(actions, /Send quote/);
  assert.match(actions, /Copy link/);
  assert.match(actions, /accepted by email provider/);
  assert.doesNotMatch(actions, /mailto:/);
});

test("calendar closes all four polish review findings", () => {
  const css = read("app/booking.css");

  assert.match(
    css,
    /\.stay-calendar-day\{[\s\S]*width:100%;[\s\S]*justify-self:stretch/,
  );

  assert.match(
    css,
    /width:min\(38px,100%\)/,
  );

  assert.match(
    css,
    /\.stay-calendar-day\.is-blocked:not\(\.is-selected\)/,
  );

  assert.doesNotMatch(css, /color:#7b8683/);
});
