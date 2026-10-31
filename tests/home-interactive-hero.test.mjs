import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("hero uses one selected real-property image, not an automatic slideshow", () => {
  const hero = read("app/_components/RetreatHero.tsx");
  const css = read("app/_components/RetreatHero.module.css");
  const home = read("app/page.tsx");

  assert.match(hero, /name="kpl-hero-photo"/);
  assert.match(hero, /type="radio"/);
  assert.match(hero, /defaultChecked=\{index === 0\}/);
  assert.match(hero, /<fieldset/);
  assert.match(hero, /<legend/);
  assert.match(hero, /alt=\{scene\.alt\}/);
  assert.match(hero, /priority=\{index === 0\}/);
  assert.match(css, /\.hero:has\(\.sceneInput\[value="1"\]:checked\)/);
  assert.match(css, /\.hero:has\(\.sceneInput\[value="2"\]:checked\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(home, /lodgePhoto\(46\)/);
  assert.match(home, /lodgePhoto\(4\)/);
  assert.match(home, /lodgePhoto\(35\)/);
  assert.doesNotMatch(hero + css, /setInterval|autoPlay|<video|drone|aerial/);
});

test("header interacts with the photograph only on the public homepage", () => {
  const shell = read("app/_components/ExperienceShell.tsx");
  const css = read("app/showcase.css");

  assert.match(shell, /const onHome = pathname === "\/"/);
  assert.match(shell, /hospitality-header-immersive/);
  assert.match(shell, /hospitality-header-scrolled/);
  assert.match(shell, /new IntersectionObserver\(/);
  assert.match(shell, /data-retreat-hero/);
  assert.match(shell, /rootMargin/);
  assert.match(shell, /observer\.disconnect\(\)/);
  assert.doesNotMatch(shell, /window\.addEventListener\("scroll"/);
  assert.match(css, /hospitality-header\.hospitality-header-immersive/);
  assert.match(css, /hospitality-header-immersive\.hospitality-header-scrolled/);
  assert.match(css, /max-width: 760px/);
});

test("visible booking links remain distinct from image selectors", () => {
  const hero = read("app/_components/RetreatHero.tsx");
  assert.match(hero, /href="\/book"/);
  assert.match(hero, /href=\{airbnbHref\}/);
  assert.match(hero, /href="\/photos"/);
  assert.doesNotMatch(hero, /<form|onSubmit|requestStay|checkout|stripe/i);
});

test("navigation uses restrained typography, not pill-on-pill styling", () => {
  const css = read("app/showcase.css");
  const start = css.indexOf("/* KPL navigation: quiet");
  assert.ok(start > 0);
  const nav = css.slice(start);

  assert.match(nav, /\.hospitality-nav a::after/);
  assert.match(nav, /transform: scaleX\(1\)/);
  assert.match(nav, /\.hospitality-header-immersive::before/);
  assert.match(nav, /\.hospitality-header-immersive::after/);
  assert.match(nav, /opacity: 0/);
  assert.match(nav, /prefers-reduced-motion: reduce/);
  assert.match(nav, /#21483d/);
  assert.match(nav, /#f8f1e4/);
  assert.doesNotMatch(nav, /border-radius: 999px|border-radius: 9999px|setInterval|@keyframes/);
});
