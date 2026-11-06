import { createHash, randomUUID } from 'node:crypto';

/** @typedef {'speaker'|'tv'|'climate'} DeviceKey */
/** @typedef {{ key: DeviceKey, status: string, state: string, actions: string[], volume: number|null, temperature: number|null, current: number|null, unit: string, min: number, max: number, sources: string[], source: string }} Device */
const deviceKeys = /** @type {DeviceKey[]} */ (['speaker', 'tv', 'climate']);
const services = { play: 'media_play', pause: 'media_pause', volume: 'volume_set', on: 'turn_on', off: 'turn_off', source: 'select_source', temperature: 'set_temperature' };
// Home Assistant MediaPlayerEntityFeature / ClimateEntityFeature.
const features = { play: 16384, pause: 1, volume: 4, on: 128, off: 256, source: 2048, temperature: 1 };
const finite = value => typeof value === 'number' && Number.isFinite(value);
const envNumber = (value, fallback) => value === undefined || value === '' ? fallback : Number(value);
const zonedTime = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.test(value);

/** A server-only broker. Callers must independently authenticate the guest. */
export function guestHome(env = process.env, { fetcher = fetch, now = Date.now, audit = event => console.info(JSON.stringify(event)) } = {}) {
  const entities = { speaker: env.KPL_HOME_SPEAKER, tv: env.KPL_HOME_TV, climate: env.KPL_HOME_CLIMATE };
  const unit = env.KPL_HOME_TEMP_UNIT;
  const min = envNumber(env.KPL_HOME_TEMP_MIN, unit === 'C' ? 20 : 68);
  const max = envNumber(env.KPL_HOME_TEMP_MAX, unit === 'C' ? 23 : 74);
  const volumeMax = envNumber(env.KPL_HOME_VOLUME_MAX, 40);
  const start = Date.parse(env.KPL_HOME_ACCESS_START ?? '');
  const end = Date.parse(env.KPL_HOME_ACCESS_END ?? '');
  const allowedSources = (env.KPL_HOME_TV_SOURCES ?? '').split('|').map(s => s.trim()).filter(s => s && s.length <= 100);
  let base;
  try { base = new URL(env.KPL_HOME_HUB_URL ?? ''); } catch { /* Missing setup remains disconnected. */ }
  const secure = base && (base.protocol === 'https:' || (env.NODE_ENV !== 'production' && base.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)));
  const validHub = secure && !base.username && !base.password && !base.search && !base.hash && base.pathname === '/' && Boolean(env.KPL_HOME_HUB_TOKEN?.trim());
  const sessionHash = createHash('sha256').update(env.KPL_GUIDEBOOK_SESSION_TOKEN ?? '').digest('hex');
  const validGrant = Boolean(env.KPL_HOME_GRANT_ID && env.KPL_GUIDEBOOK_SESSION_TOKEN && env.KPL_HOME_SESSION_HASH === sessionHash && zonedTime(env.KPL_HOME_ACCESS_START) && zonedTime(env.KPL_HOME_ACCESS_END) && Number.isFinite(start) && Number.isFinite(end) && end > start && end - start <= 31 * 86400000);
  const validLimits = Number.isInteger(volumeMax) && volumeMax >= 0 && volumeMax <= 50 && finite(min) && finite(max) && min <= max && (unit === 'C' ? min >= 16 && max <= 27 : min >= 60 && max <= 80);
  function access() {
    if (env.KPL_HOME_ENABLED !== 'true' || !validHub || !validGrant || !validLimits) return 'not_connected';
    return now() >= start && now() < end ? 'ready' : 'outside_stay';
  }
  function entityFor(key) {
    if (!deviceKeys.includes(key)) throw new Error('Denied');
    const entity = entities[key];
    const pattern = key === 'climate' ? /^climate\.[a-z0-9_]+$/ : /^media_player\.[a-z0-9_]+$/;
    if (!entity || !pattern.test(entity)) throw new Error('Device not configured');
    return entity;
  }
  async function request(path, body) {
    if (access() !== 'ready') throw new Error('Access unavailable');
    const response = await fetcher(new URL(path, base), {
      method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${env.KPL_HOME_HUB_TOKEN}`, ...(body && { 'Content-Type': 'application/json' }) },
      body: body && JSON.stringify(body), redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error('Hub unavailable');
    if (body) { await response.body?.cancel(); return null; }
    return response.json();
  }
  /** @param {DeviceKey} key @returns {Device} */
  function blank(key) {
    return { key, status: 'not_connected', state: '', actions: [], volume: null, temperature: null, current: null, unit: unit ?? '', min, max, sources: [], source: '' };
  }
  /** @param {DeviceKey} key @returns {Promise<Device>} */
  async function read(key) {
    const entity = entityFor(key);
    const raw = await request(`/api/states/${entity}`);
    if (raw?.entity_id !== entity || typeof raw.state !== 'string') throw new Error('Invalid state');
    const a = raw.attributes ?? {};
    const device = blank(key);
    device.status = ['unavailable', 'unknown'].includes(raw.state) ? 'offline' : 'ready';
    device.state = ['playing', 'paused', 'idle', 'on', 'off', 'buffering', 'heat', 'cool', 'auto', 'heat_cool', 'fan_only', 'dry'].includes(raw.state) ? raw.state : 'ready';
    if (device.status !== 'ready') return device;
    const supported = Number.isInteger(a.supported_features) ? a.supported_features : 0;
    if (key === 'climate') {
      const config = await request('/api/config');
      // A setpoint is unsafe if the hub's unit or single-target mode is unknown.
      if (!['C', 'F'].includes(unit ?? '') || config?.unit_system?.temperature !== `°${unit}`) throw new Error('Temperature unit mismatch');
      device.current = finite(a.current_temperature) ? a.current_temperature : null;
      device.temperature = finite(a.temperature) ? a.temperature : null;
      device.min = finite(a.min_temp) ? Math.max(min, a.min_temp) : min;
      device.max = finite(a.max_temp) ? Math.min(max, a.max_temp) : max;
      if (supported & features.temperature && device.temperature !== null && ['heat', 'cool', 'auto'].includes(raw.state) && device.min <= device.max) device.actions = ['temperature'];
    } else {
      device.volume = finite(a.volume_level) && a.volume_level >= 0 && a.volume_level <= 1 ? Math.round(a.volume_level * 100) : null;
      device.max = volumeMax;
      device.min = 0;
      device.actions = ['play', 'pause', 'volume', ...(key === 'tv' ? ['on', 'off', 'source'] : [])].filter(command => (supported & features[command]) !== 0);
      device.sources = key === 'tv' && Array.isArray(a.source_list) ? allowedSources.filter(source => a.source_list.includes(source)) : [];
      device.source = device.sources.includes(a.source) ? a.source : '';
      if (!device.sources.length) device.actions = device.actions.filter(action => action !== 'source');
    }
    return device;
  }
  async function snapshot() {
    const status = access();
    const devices = await Promise.all(deviceKeys.map(async key => {
      const empty = blank(key);
      if (status !== 'ready') return empty;
      try { entityFor(key); } catch { return empty; }
      try { return await read(key); } catch { return { ...empty, status: 'offline' }; }
    }));
    return { status, devices, checkedAt: new Date(now()).toISOString() };
  }
  async function control(key, command, value) {
    // Never accept a URL, entity ID, service name, or arbitrary service body from the browser.
    const receipt = { event: 'guest_home', id: randomUUID(), at: new Date(now()).toISOString(), grant: env.KPL_HOME_GRANT_ID ?? null, device: deviceKeys.includes(key) ? key : 'invalid', command: Object.hasOwn(services, command) ? command : 'invalid' };
    let sent = false;
    try {
      if (access() !== 'ready' || !deviceKeys.includes(key) || !Object.hasOwn(services, command)) throw new Error('Denied');
      const before = await read(key);
      if (!before.actions.includes(command)) throw new Error('Unsupported');
      const body = { entity_id: entityFor(key) };
      if (command === 'volume') {
        if (!Number.isInteger(value) || value < 0 || value > volumeMax) throw new Error('Volume denied');
        body.volume_level = value / 100;
      }
      if (command === 'temperature') {
        if (!finite(value) || !Number.isInteger(value * 2) || value < before.min || value > before.max) throw new Error('Temperature denied');
        body.temperature = value;
      }
      if (command === 'source') {
        if (!before.sources.includes(value)) throw new Error('Source denied');
        body.source = value;
      }
      audit({ ...receipt, result: 'requested', ...(['volume', 'temperature', 'source'].includes(command) && { value }) });
      sent = true;
      await request(`/api/services/${key === 'climate' ? 'climate' : 'media_player'}/${services[command]}`, body);
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt) await new Promise(resolve => setTimeout(resolve, 350));
        const observed = await read(key);
        const confirmed = observed.status === 'ready' && (command === 'volume' ? observed.volume === value : command === 'temperature' ? observed.temperature === value : command === 'source' ? observed.source === value : command === 'on' ? ['on', 'playing', 'paused', 'idle'].includes(observed.state) : observed.state === ({ play: 'playing', pause: 'paused', off: 'off' }[command]));
        if (confirmed) { audit({ ...receipt, result: 'confirmed' }); return 'confirmed'; }
      }
      audit({ ...receipt, result: 'unconfirmed' });
      return 'unconfirmed';
    } catch {
      const result = sent ? 'unconfirmed' : 'denied';
      audit({ ...receipt, result });
      return result;
    }
  }
  return { snapshot, control };
}
