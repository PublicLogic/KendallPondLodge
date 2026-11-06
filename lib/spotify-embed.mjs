/** Accept only Spotify's share URLs; never place an arbitrary URL in an iframe. */
export function spotifyEmbed(raw) {
  try {
    const url = new URL(raw.trim());
    if (url.origin !== 'https://open.spotify.com' || url.username || url.password) return null;
    const match = url.pathname.match(/^\/(?:intl-[a-z-]+\/)?(?:embed\/)?(track|album|playlist)\/([A-Za-z0-9]{22})\/?$/);
    if (!match) return null;
    const [, type, id] = match;
    return {
      url: `https://open.spotify.com/embed/${type}/${id}`,
      externalUrl: `https://open.spotify.com/${type}/${id}`,
      height: type === 'track' ? 152 : 352,
    };
  } catch {
    return null;
  }
}
