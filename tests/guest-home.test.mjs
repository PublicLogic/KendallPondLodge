import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { guestHome } from '../lib/guest-home.mjs';

const time = Date.parse('2026-11-06T12:00:00Z');
function setup(overrides = {}, options = {}) {
  const env = {
    NODE_ENV: 'production', KPL_HOME_ENABLED: 'true', KPL_HOME_HUB_URL: 'https://hub.example', KPL_HOME_HUB_TOKEN: 'fixture-only-token',
    KPL_GUIDEBOOK_SESSION_TOKEN: 'fixture-session', KPL_HOME_SESSION_HASH: createHash('sha256').update('fixture-session').digest('hex'),
    KPL_HOME_GRANT_ID: 'fixture-stay', KPL_HOME_ACCESS_START: '2026-11-06T00:00:00Z', KPL_HOME_ACCESS_END: '2026-11-07T00:00:00Z',
    KPL_HOME_SPEAKER: 'media_player.lodge', KPL_HOME_TV: 'media_player.tv', KPL_HOME_CLIMATE: 'climate.lodge', KPL_HOME_TEMP_UNIT: 'F', KPL_HOME_TV_SOURCES: 'HDMI 1|Apple TV',
    ...overrides,
  };
  const calls = [], events = [];
  const states = {
    'media_player.lodge': { state: 'paused', attributes: { volume_level: .2, supported_features: 16389 } },
    'media_player.tv': { state: 'on', attributes: { volume_level: .2, supported_features: 18821, source_list: ['HDMI 1', 'Apple TV', 'Settings'], source: 'HDMI 1' } },
    'climate.lodge': { state: 'heat', attributes: { temperature: 70, current_temperature: 69, supported_features: 1, min_temp: 62, max_temp: 78 } },
  };
  const home = guestHome(env, { now: options.now ?? (() => time), audit: event => events.push(event), fetcher: async (url, init) => {
    calls.push({ path: url.pathname, init });
    assert.equal(url.origin, 'https://hub.example');
    assert.equal(init.headers.Authorization, 'Bearer fixture-only-token');
    assert.equal(init.redirect, 'error');
    if (options.fail) throw new Error('token-bearing upstream error');
    if (url.pathname === '/api/config') return Response.json({ unit_system: { temperature: options.unit ?? '°F' } });
    if (init.method === 'POST') {
      const body = JSON.parse(init.body);
      const s = states[body.entity_id];
      if (!options.stale) {
        if (body.volume_level !== undefined) s.attributes.volume_level = body.volume_level;
        if (body.temperature !== undefined) s.attributes.temperature = body.temperature;
        if (body.source !== undefined) s.attributes.source = body.source;
        if (url.pathname.endsWith('/media_play')) s.state = 'playing';
        if (url.pathname.endsWith('/media_pause')) s.state = 'paused';
        if (url.pathname.endsWith('/turn_off')) s.state = 'off';
      }
      options.afterPost?.();
      return Response.json([]);
    }
    const entity = url.pathname.split('/').pop();
    return Response.json({ entity_id: entity, ...states[entity] });
  } });
  return { home, calls, events, states };
}

test('no hardware configuration means no network requests and no pretend states', async () => {
  const { home, calls } = setup({ KPL_HOME_ENABLED: undefined });
  assert.equal((await home.snapshot()).status, 'not_connected');
  assert.equal(await home.control('tv', 'on'), 'denied');
  assert.equal(calls.length, 0);
});

test('grant expiry, start, session binding, invalid limits and insecure origins fail closed', async () => {
  for (const env of [
    { KPL_HOME_ACCESS_END: '2026-11-06T12:00:00Z' }, { KPL_HOME_ACCESS_START: '2026-11-06T13:00:00Z' },
    { KPL_HOME_ACCESS_END: '2027-01-01T00:00:00Z' }, { KPL_HOME_GRANT_ID: '' }, { KPL_HOME_SESSION_HASH: 'wrong' },
    { KPL_HOME_ACCESS_START: '2026-11-06T00:00:00' },
    { KPL_GUIDEBOOK_SESSION_TOKEN: 'rotated' }, { KPL_HOME_VOLUME_MAX: '100' }, { KPL_HOME_TEMP_MIN: 'abc' },
    { KPL_HOME_HUB_URL: 'http://localhost' }, { KPL_HOME_HUB_URL: 'https://hub.example/path' }, { KPL_HOME_HUB_URL: 'https://user:pass@hub.example' },
  ]) {
    const { home, calls } = setup(env);
    assert.equal(await home.control('speaker', 'play'), 'denied', JSON.stringify(env));
    assert.equal(calls.length, 0);
  }
});

test('snapshot only returns guest fields and supported capabilities', async () => {
  const { home } = setup();
  const snapshot = await home.snapshot();
  assert.equal(snapshot.status, 'ready');
  assert.deepEqual(snapshot.devices[0].actions, ['play', 'pause', 'volume']);
  assert.equal(snapshot.devices[2].current, 69);
  assert.deepEqual(snapshot.devices[1].sources, ['HDMI 1', 'Apple TV']);
  assert.doesNotMatch(JSON.stringify(snapshot), /fixture|hub.example|media_player\.|entity_id/);
});

test('volume action goes only to the configured speaker with bounded payload and readback', async () => {
  const { home, calls, events } = setup();
  assert.equal(await home.control('speaker', 'volume', 35), 'confirmed');
  const post = calls.find(c => c.init.method === 'POST');
  assert.equal(post.path, '/api/services/media_player/volume_set');
  assert.deepEqual(JSON.parse(post.init.body), { entity_id: 'media_player.lodge', volume_level: .35 });
  assert.deepEqual(events.map(e => e.result), ['requested', 'confirmed']);
  assert.doesNotMatch(JSON.stringify(events), /fixture-only-token|fixture-session/);
});

test('arbitrary entities, services, sources, unsupported actions and out-of-range values never write', async () => {
  for (const [key, command, value] of [
    ['lock.front_door', 'on'], ['speaker', 'play_media', 'https://evil.example'], ['speaker', 'constructor'],
    ['speaker', 'volume', 51], ['speaker', 'volume', -1], ['speaker', 'volume', NaN], ['speaker', 'volume', 15.2],
    ['speaker', 'on'], ['tv', 'source', 'Settings'], ['tv', 'source', 'https://evil.example'],
    ['climate', 'temperature', 85], ['climate', 'temperature', 67], ['climate', 'temperature', 70.1],
  ]) {
    const { home, calls } = setup();
    assert.equal(await home.control(key, command, value), 'denied');
    assert.equal(calls.filter(c => c.init.method === 'POST').length, 0);
  }
});

test('TV source, power, playback and thermostat target round-trip through the hub', async () => {
  for (const [key, command, value] of [['tv', 'source', 'Apple TV'], ['tv', 'off'], ['speaker', 'play'], ['climate', 'temperature', 72]]) {
    const { home, calls } = setup();
    assert.equal(await home.control(key, command, value), 'confirmed');
    assert.equal(calls.filter(c => c.init.method === 'POST').length, 1);
  }
});

test('device limits, capabilities, temperature units and operating modes are enforced', async () => {
  const mismatch = setup({}, { unit: '°C' });
  assert.equal(await mismatch.home.control('climate', 'temperature', 72), 'denied');
  assert.equal(mismatch.calls.filter(c => c.init.method === 'POST').length, 0);
  const fixture = setup();
  fixture.states['climate.lodge'].attributes.max_temp = 71;
  assert.equal(await fixture.home.control('climate', 'temperature', 72), 'denied');
  fixture.states['climate.lodge'].state = 'heat_cool';
  assert.equal(await fixture.home.control('climate', 'temperature', 70), 'denied');
  fixture.states['media_player.lodge'].attributes.supported_features = 0;
  assert.equal(await fixture.home.control('speaker', 'play'), 'denied');
  assert.equal(fixture.calls.filter(c => c.init.method === 'POST').length, 0);
});

test('stale readback never claims confirmation', async () => {
  const { home, events } = setup({}, { stale: true });
  assert.equal(await home.control('speaker', 'play'), 'unconfirmed');
  assert.equal(events.at(-1).result, 'unconfirmed');
});

test('expiry is rechecked during the command; unavailable hub hides internal details', async () => {
  let clock = time;
  const fixture = setup({}, { now: () => clock, afterPost: () => { clock += 86400000; } });
  assert.equal(await fixture.home.control('speaker', 'play'), 'unconfirmed');
  const offline = setup({}, { fail: true });
  const snapshot = await offline.home.snapshot();
  assert(snapshot.devices.every(d => d.status === 'offline'));
  assert.doesNotMatch(JSON.stringify(snapshot), /token|upstream/);
});
