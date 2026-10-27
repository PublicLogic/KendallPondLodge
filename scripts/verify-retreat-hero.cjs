/* Read-only QA for the approved split pond header. Optional external QA dependencies. */
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const output = process.env.QA_OUTPUT || '/tmp/kpl-pond-header';
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const report = [];
  try {
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
      await context.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(base, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      await page.waitForFunction(() => document.querySelector('[data-pond-header] h1')?.textContent.replace(/\s+/g, ' ').trim() === 'Down by the pond.');
      await page.locator('[data-pond-photos]').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => [...document.querySelectorAll('[data-pond-photos] img')].every(image => image.complete && image.naturalWidth > 0));
      await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); });
      const geometry = await page.evaluate(() => {
        const copy = document.querySelector('[data-pond-copy]').getBoundingClientRect();
        const photos = document.querySelector('[data-pond-photos]').getBoundingClientRect();
        const lead = document.querySelector('[data-pond-photo="0"]').getBoundingClientRect();
        const detail = document.querySelector('[data-pond-photo="1"]').getBoundingClientRect();
        return { overflow: document.documentElement.scrollWidth > innerWidth, sideBySide: copy.right <= photos.left + 1, stacked: copy.bottom <= photos.top + 1, leadWidth: lead.width, detailWidth: detail.width, imageCount: document.querySelectorAll('[data-pond-photos] img').length, h1Count: document.querySelectorAll('h1').length };
      });
      assert.equal(geometry.overflow, false);
      assert.equal(geometry.imageCount, 3);
      assert.equal(geometry.h1Count, 1);
      assert.ok(geometry.leadWidth > geometry.detailWidth * 1.8);
      assert.ok(width > 800 ? geometry.sideBySide : geometry.stacked);
      const primary = page.locator('[data-pond-copy] a').first();
      const target = await primary.getAttribute('href');
      assert.ok(target === '/book' || target.startsWith('https://www.airbnb.com/rooms/'));
      await primary.focus();
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('href')), '/photos');
      const axe = await new AxeBuilder({ page }).include('[data-pond-header]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      const violations = axe.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }));
      const result = { width, ...geometry, target, violations, errors };
      report.push(result);
      assert.equal(violations.length, 0, JSON.stringify(result));
      assert.equal(errors.length, 0, JSON.stringify(errors));
      if ([390, 1440].includes(width)) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `${output}/header-${width}.png` });
      }
      await context.close();
    }
    const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
    const page = await noJs.newPage();
    await page.goto(base, { waitUntil: 'load' });
    assert.equal(await page.locator('[data-pond-header] h1').textContent(), 'Down by the pond.');
    assert.equal(await page.locator('[data-pond-photos] a').count(), 3);
    await noJs.close();
    fs.writeFileSync(`${output}/audit.json`, JSON.stringify({ report, noJavaScriptPassed: true }, null, 2));
    console.log(JSON.stringify({ headerWidths: report.length, noJavaScriptPassed: true, failures: report.filter(row => row.overflow || row.violations.length || row.errors.length) }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
