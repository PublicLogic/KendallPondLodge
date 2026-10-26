import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) =>
  fs.readFileSync(path.join(root, file), "utf8");

test("authenticated guidebook owns a fixed dashboard shell", () => {
  const shell = read("app/_components/ExperienceShell.tsx");
  const dashboard = read("app/guidebook/(dashboard)/page.tsx");
  const css = read("app/experience.css");

  assert.match(
    shell,
    /if \(isGuidebook\)[\s\S]*return <>\{children\}<\/>/,
  );

  assert.match(dashboard, /Your stay command center/);
  assert.match(dashboard, /What do you need\?/);
  assert.match(dashboard, /AskKendall embedded/);

  assert.match(css, /\.guide-dashboard\{[\s\S]*height:100dvh/);
  assert.match(css, /\.guide-dashboard\{[\s\S]*overflow:hidden/);
  assert.match(css, /\.guide-shell-content-inner\{[\s\S]*overflow-y:auto/);
});
