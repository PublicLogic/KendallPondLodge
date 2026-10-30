import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();

const read = (file) =>
  fs.readFileSync(path.join(root, file), 'utf8');

test('owner availability combines fresh Airbnb and PJ booking state', () => {
  const page = read('app/owner/availability/page.tsx');

  assert.match(
    page,
    /requireKplOwner\('\/owner\/availability'\)/,
  );

  assert.match(
    page,
    /fetchAirbnbIcs\(\{ fresh: true \}\)/,
  );

  assert.match(page, /parseIcsEvents/);
  assert.match(page, /bookingClient\(\)\.list\(100\)/);

  for (const label of [
    'Airbnb stay',
    'Airbnb block',
    'Direct stay',
    'Quote hold',
    'Request',
  ]) {
    assert.ok(page.includes(label), label);
  }

  assert.doesNotMatch(page, /KPL_AIRBNB_ICAL_URL/);
  assert.doesNotMatch(page, /airbnb\.com\/calendar\/ical/);
});

test('owner availability fails visibly when source state is incomplete', () => {
  const page = read('app/owner/availability/page.tsx');

  assert.match(
    page,
    /Do not treat blank dates as available/,
  );

  assert.match(
    page,
    /availability is checked again\s+before every quote and payment/s,
  );

  assert.match(
    page,
    /Availability is intentionally read-only/,
  );
});
