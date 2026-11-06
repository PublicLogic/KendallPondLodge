/** @typedef {{ state: string, volume: number | null }} Speaker */
const actions = {
  start: 'play_media',
  play: 'media_play',
  pause: 'media_pause',
  volume: 'volume_set',
};

export function homeAssistantMusic(env = process.env) {
  const endpoint = env.KPL_MUSIC_HUB_URL?.trim();
  const token = env.KPL_MUSIC_HUB_TOKEN?.trim();
  const speaker = env.KPL_MUSIC_SPEAKER?.trim();
  const media = env.KPL_MUSIC_PRESET_ID?.trim();
  const mediaType = env.KPL_MUSIC_PRESET_TYPE?.trim();
  if (!endpoint || !token || !speaker || !media || !mediaType) return null;

  const base = new URL(endpoint);
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname);
  const secure = base.protocol === 'https:' ||
    (base.protocol === 'http:' && loopback && env.NODE_ENV !== 'production');
  if (!secure || base.username || base.password || base.search || base.hash ||
      base.pathname !== '/' || !/^media_player\.[a-z0-9_]+$/.test(speaker)) {
    throw new Error('Invalid music connection');
  }

  async function request(path, body) {
    const response = await fetch(new URL(path, base), {
      method: body ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body && { 'Content-Type': 'application/json' }),
      },
      body: body && JSON.stringify(body),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error('Music hub request failed');
    if (!body) return response.json();
    await response.body?.cancel();
  }

  /** @returns {Promise<Speaker>} */
  async function read() {
    const entity = await request(`/api/states/${speaker}`);
    if (entity?.entity_id !== speaker || typeof entity.state !== 'string') {
      throw new Error('Unexpected music hub response');
    }
    const level = entity.attributes?.volume_level;
    return {
      state: entity.state,
      volume: typeof level === 'number' && level >= 0 && level <= 1 ? Math.round(level * 100) : null,
    };
  }

  return {
    read,
    async control(command, volume) {
      if (!Object.hasOwn(actions, command)) throw new Error('Music command is not allowed');
      if (command === 'volume' && (!Number.isInteger(volume) || volume < 0 || volume > 50)) {
        throw new Error('Guest volume must be between 0 and 50');
      }
      const body = { entity_id: speaker };
      if (command === 'start') {
        body.media_content_id = media;
        body.media_content_type = mediaType;
      }
      if (command === 'volume') body.volume_level = volume / 100;
      await request(`/api/services/media_player/${actions[command]}`, body);

      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt) await new Promise(resolve => setTimeout(resolve, 450));
        const observed = await read();
        const matches = command === 'volume' ? observed.volume === volume :
          observed.state === (command === 'pause' ? 'paused' : 'playing');
        if (matches) return true;
      }
      return false;
    },
  };
}
