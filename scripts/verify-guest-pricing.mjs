/* Run against a rehearsal with two available nights in the displayed month.
   BASE_URL and CHECK_IN select the rehearsal and arrival. No form is submitted. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

async function main() {
  const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:3000');
  const arrival = process.env.CHECK_IN;
  assert.match(arrival || '', /^\d{4}-\d{2}-\d{2}$/, 'Set CHECK_IN to an available arrival date');
  const departure = new Date(`${arrival}T00:00:00Z`);
  departure.setUTCDate(departure.getUTCDate() + 2);
  const checkout = departure.toISOString().slice(0, 10);

  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH });
  try {
    for (const width of [320, 390, 768, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
      const response = await page.goto(new URL('/book', base).href);
      assert.equal(response.status(), 200);
      const guests = page.getByRole('spinbutton', { name: 'Guests', exact: true });
      await guests.waitFor();
      const hint = page.locator('#guest-pricing');
      const amount = hint.locator('output');
      assert.equal(await guests.getAttribute('aria-describedby'), 'guest-pricing');
      assert.match(await hint.innerText(), /\$128\.70 per night/);
      assert.equal(await amount.innerText(), '');
      assert.ok(await hint.evaluate(el => Boolean(el.compareDocumentPosition(document.querySelector('input[name="guest_name"]')) & Node.DOCUMENT_POSITION_FOLLOWING)));

      await page.getByRole('button', { name: arrival, exact: true }).click();
      await page.getByRole('button', { name: checkout, exact: true }).click();
      assert.match(await amount.innerText(), /\$0\.00/);
      for (const [count, expected] of [['3', '$257.40'], ['8', '$1,544.40']]) {
        await guests.fill(count);
        const text = await amount.innerText();
        assert.ok(text.includes(expected), text);
        assert.match(text, /before tax/);
      }
      for (const invalid of ['', '9', '2.5']) {
        await guests.fill(invalid);
        assert.equal(await amount.innerText(), '');
      }
      await guests.fill('3');
      await page.getByRole('button', { name: 'Clear', exact: true }).click();
      assert.equal(await amount.innerText(), '');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px`);
      await page.close();
      console.log(`Booking form pricing passed at ${width}px`);
    }
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
