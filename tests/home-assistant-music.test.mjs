import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { homeAssistantMusic } from '../lib/home-assistant-music.mjs';

test('guestbook music sends approved commands and reads the configured speaker over HTTP', async t => {
  let state = 'idle';
  let volume = 0.25;
  let ignorePause = false;
  const commands = [];
  const speaker = 'media_player.lodge';
  const server = createServer(async (request, response) => {
    if (request.headers.authorization !== 'Bearer fixture-token') return response.writeHead(401).end();
    response.setHeader('Content-Type', 'application/json');
    if (request.method === 'GET' && request.url === `/api/states/${speaker}`) {
      return response.end(JSON.stringify({ entity_id: speaker, state, attributes: { volume_level: volume } }));
    }
    if (request.method === 'POST' && request.url.startsWith('/api/services/media_player/')) {
      let raw = '';
      for await (const chunk of request) raw += chunk;
      const body = JSON.parse(raw);
      const action = request.url.split('/').at(-1);
      commands.push([action, body]);
      if (action === 'play_media' || action === 'media_play') state = 'playing';
      if (action === 'media_pause' && !ignorePause) state = 'paused';
      if (action === 'volume_set') volume = body.volume_level;
      return response.end('[]');
    }
    response.writeHead(404).end();
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));

  const env = {
    KPL_MUSIC_HUB_URL: `http://127.0.0.1:${server.address().port}`,
    KPL_MUSIC_HUB_TOKEN: 'fixture-token',
    KPL_MUSIC_SPEAKER: speaker,
    KPL_MUSIC_PRESET_ID: 'fixture-mix',
    KPL_MUSIC_PRESET_TYPE: 'music',
  };
  const music = homeAssistantMusic(env);
  assert.deepEqual(await music.read(), { state: 'idle', volume: 25 });
  await assert.rejects(music.control('turn_off'), /not allowed/);
  await assert.rejects(music.control('volume', 51), /between/);
  await assert.rejects(music.control('volume', 24.5), /between/);
  assert.equal(commands.length, 0);
  assert.equal(await music.control('start'), true);
  assert.equal(await music.control('pause'), true);
  assert.equal(await music.control('play'), true);
  assert.equal(await music.control('volume', 35), true);
  ignorePause = true;
  assert.equal(await music.control('pause'), false);
  assert.deepEqual(await music.read(), { state: 'playing', volume: 35 });
  assert.deepEqual(commands, [
    ['play_media', { entity_id: speaker, media_content_id: 'fixture-mix', media_content_type: 'music' }],
    ['media_pause', { entity_id: speaker }],
    ['media_play', { entity_id: speaker }],
    ['volume_set', { entity_id: speaker, volume_level: 0.35 }],
    ['media_pause', { entity_id: speaker }],
  ]);
  await assert.rejects(homeAssistantMusic({ ...env, KPL_MUSIC_HUB_TOKEN: 'wrong' }).read());
  assert.throws(() => homeAssistantMusic({ ...env, NODE_ENV: 'production' }), /Invalid/);
  assert.equal(homeAssistantMusic({}), null);
});
