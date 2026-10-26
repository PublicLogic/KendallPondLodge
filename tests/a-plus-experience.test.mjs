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

  assert.match(home, /hospitality-cover/);
  assert.match(home, /The Lodge at Kendall Pond/);
  assert.match(home, /weekends that/);

  assert.doesNotMatch(home, /PageHero/);
  assert.doesNotMatch(home, /StatBand/);
  assert.doesNotMatch(home, /Your place by the pond/);

  assert.match(shell, /hospitality-menu/);
  assert.doesNotMatch(shell, /PublicMobileNav/);
});

test("authenticated Guidebook owns the viewport", () => {
  const shell = read("app/_components/ExperienceShell.tsx");
  const guide = read("app/guidebook/(dashboard)/page.tsx");
  const css = read("app/a-plus.css");

  assert.match(
    shell,
    /if \(isGuidebookAccess \|\| isGuidebook\)[\s\S]*return <>\{children\}<\/>/,
  );

  assert.match(guide, /Your stay command center/);
  assert.match(guide, /What do you need\?/);
  assert.match(guide, /AskKendall embedded/);

  assert.match(
    css,
    /\.guide-dashboard\{[\s\S]*height:100dvh;[\s\S]*overflow:hidden/,
  );

  assert.match(
    css,
    /\.guide-shell-content-inner\{[\s\S]*overflow-y:auto/,
  );
});

test("owner bookings expose the governed four-step workflow", () => {
  const page = read("app/owner/bookings/page.tsx");
  const actions = read("app/owner/bookings/QuoteLinkActions.tsx");

  assert.match(page, /"Request"/);
  assert.match(page, /"Quote"/);
  assert.match(page, /"Airbnb block"/);
  assert.match(page, /"Payment"/);

  assert.match(page, /QuoteLinkActions/);
  assert.match(page, /Airbnb block verified/);

  assert.match(actions, /Copy quote link/);
  assert.match(actions, /Open email draft/);
  assert.match(
    actions,
    /Email delivery is still manual until PJ/,
  );
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
