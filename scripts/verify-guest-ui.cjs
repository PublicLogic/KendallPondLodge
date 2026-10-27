/* Optional QA tooling; install Playwright and axe outside production dependencies.
   See docs/GUEST-READY-VERIFICATION.md. No forms are submitted. */
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:3000');
const output = process.env.QA_OUTPUT || '/tmp/kpl-guest-qa';
const routes = ['/', '/lodge', '/grounds', '/rates', '/photos', '/book', '/explore', '/area', '/events'];
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const results = [];
  try {
    for (const width of [320, 390, 768, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
      const page = await context.newPage();
      for (const route of routes) {
        const errors = [];
        const onError = error => errors.push(error.message);
        page.on('pageerror', onError);
        const response = await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' });
        await page.evaluate(async () => {
          await document.fonts.ready;
          for (let y = 0; y < document.body.scrollHeight; y += 700) {
            window.scrollTo(0, y);
            await new Promise(resolve => setTimeout(resolve, 60));
          }
          window.scrollTo(0, 0);
        });
        const metrics = await page.evaluate(() => ({
          viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          brokenImages: [...document.images].filter(image => image.getBoundingClientRect().width > 0 && image.complete && image.naturalWidth === 0).map(image => image.alt),
        }));
        const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        const violations = audit.violations.map(item => ({ id: item.id, impact: item.impact, targets: item.nodes.map(node => node.target) }));
        results.push({ route, width, status: response.status(), ...metrics, errors, violations });
        page.off('pageerror', onError);
        if ([390, 1440].includes(width) && route === '/') await page.screenshot({ path: path.join(output, `home-${width}.png`), fullPage: true });
      }
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto(new URL('/photos', base).href);
    await page.getByRole('button', { name: 'Bedrooms & baths', exact: true }).click();
    assert.equal(await page.locator('.gallery-photo-card').count(), 8);
    await page.locator('.gallery-photo-card').first().click();
    assert.equal(await page.locator('dialog').evaluate(element => element.open), true);
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), 'hidden');
    const src = await page.locator('dialog img').getAttribute('src');
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(previous => document.querySelector('dialog img')?.getAttribute('src') !== previous, src);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog').evaluate(element => element.open), false);
    assert.equal(await page.locator('.gallery-photo-card').first().evaluate(element => element === document.activeElement), true);
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).overflow), 'hidden');
    await page.locator('.hospitality-menu summary').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.hospitality-menu').evaluate(element => element.open), false);
    await page.locator('.hospitality-menu summary').click();
    await page.locator('.hospitality-menu').getByRole('link', { name: 'The Lodge', exact: true }).click();
    await page.waitForURL('**/lodge');
    assert.equal(await page.locator('.hospitality-menu').evaluate(element => element.open), false);
    await page.goto(base.href);
    await page.locator('#stay-pets summary').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#stay-pets').evaluate(element => element.open), true);
    await context.close();
    const failures = results.filter(item => item.status !== 200 || item.scrollWidth > item.viewport || item.brokenImages.length || item.errors.length || item.violations.length);
    fs.writeFileSync(path.join(output, 'audit.json'), JSON.stringify({ results, interactionChecksPassed: true }, null, 2));
    console.log(JSON.stringify({ pageViewportChecks: results.length, failures, interactionChecksPassed: true }));
    assert.equal(failures.length, 0, 'Rendered page checks failed; inspect audit.json');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
