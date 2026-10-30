import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();

const read = (file) =>
  fs.readFileSync(
    path.join(root, file),
    'utf8',
  );

test(
  'public booking uses governed Airbnb-style calendar data',
  () => {
    const page = read('app/book/page.tsx');
    const picker = read(
      'app/book/StayRequestForm.tsx',
    );

    assert.match(
      page,
      /fetchAirbnbIcs\(\{ fresh: true \}\)/,
    );

    assert.match(
      page,
      /blockedNightsFromIcs/,
    );

    assert.match(
      page,
      /bookingClient\(\)\.list\(100\)/,
    );

    for (const status of [
      'quoted',
      'checkout',
      'confirmed',
    ]) {
      assert.ok(page.includes(status), status);
    }

    assert.match(
      picker,
      /name="check_in"/,
    );

    assert.match(
      picker,
      /name="check_out"/,
    );

    assert.match(
      picker,
      /30/,
    );

    assert.match(
      picker,
      /night/,
    );

    assert.doesNotMatch(
      picker,
      /KPL_AIRBNB_ICAL_URL/,
    );

    assert.doesNotMatch(
      picker,
      /airbnb\.com\/calendar\/ical/,
    );

    assert.doesNotMatch(
      picker,
      /type="date"/,
    );
  },
);

test(
  'guest request rechecks Airbnb and PJ before creating request',
  () => {
    const action = read(
      'app/book/actions.ts',
    );

    assert.match(
      action,
      /fetchAirbnbIcs\(\{\s*fresh: true,\s*\}\)/s,
    );

    assert.match(
      action,
      /airbnbStayStatus/,
    );

    assert.match(
      action,
      /client\.list\(100\)/,
    );

    assert.match(
      action,
      /calendar_conflict/,
    );

    assert.match(
      action,
      /overlapping_active_stay/,
    );

    assert.ok(
      action.indexOf('fetchAirbnbIcs') <
        action.indexOf(
          'client.createRequest(input)',
        ),
    );
  },
);
