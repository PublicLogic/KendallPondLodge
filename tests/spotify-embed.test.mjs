import assert from 'node:assert/strict';
import test from 'node:test';
import { spotifyEmbed } from '../lib/spotify-embed.mjs';

test('Spotify links normalize regional, embedded, and shared URLs', () => {
  const id = '37i9dQZF1DZ06evO3eIivx';
  for (const prefix of ['', 'intl-de/', 'embed/']) {
    assert.deepEqual(spotifyEmbed(`https://open.spotify.com/${prefix}playlist/${id}?si=tracking`), {
      url: `https://open.spotify.com/embed/playlist/${id}`,
      externalUrl: `https://open.spotify.com/playlist/${id}`,
      height: 352,
    });
  }
  assert.equal(spotifyEmbed(`https://open.spotify.com/track/${id}`).height, 152);
});

test('Spotify embeds reject credentials, other origins, protocols, types, and malformed IDs', () => {
  for (const link of [
    'javascript:alert(1)',
    'https://open.spotify.com.evil.test/track/37i9dQZF1DZ06evO3eIivx',
    'https://user:password@open.spotify.com/track/37i9dQZF1DZ06evO3eIivx',
    'http://open.spotify.com/track/37i9dQZF1DZ06evO3eIivx',
    'https://open.spotify.com/artist/37i9dQZF1DZ06evO3eIivx',
    'https://open.spotify.com/track/invalid',
  ]) assert.equal(spotifyEmbed(link), null);
});
