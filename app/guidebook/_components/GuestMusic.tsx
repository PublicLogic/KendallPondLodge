'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { spotifyEmbed } from '@/lib/spotify-embed.mjs';

export function GuestMusic() {
  const pathname = usePathname();
  const inline = pathname === '/guidebook' || pathname === '/guidebook/audio';
  const section = useRef<HTMLElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const objectUrl = useRef<string | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const [source, setSource] = useState('app');
  const [player, setPlayer] = useState('Spotify');
  const [connection, setConnection] = useState('Spotify Connect');
  const [speaker, setSpeaker] = useState('Kendall Pond Echo');
  const players: Record<string, string> = { Spotify: 'https://open.spotify.com/', 'Apple Music': 'https://music.apple.com/', 'YouTube Music': 'https://music.youtube.com/', 'Amazon Music': 'https://music.amazon.com/', Other: '' };
  const [url, setUrl] = useState('');
  const [embed, setEmbed] = useState<ReturnType<typeof spotifyEmbed>>(null);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const hasMedia = Boolean(embed || fileName);
  const docked = expanded && (!inline || !visible);

  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  function openPlayer() {
    setExpanded(true);
    requestAnimationFrame(() => close.current?.focus());
  }

  function closePlayer() {
    setExpanded(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }

  function loadSpotify(event: FormEvent) {
    event.preventDefault();
    const next = spotifyEmbed(url);
    if (!next) {
      setMessage('Paste a Spotify share link for a song, album, or playlist.');
      return;
    }
    audio.current?.pause();
    setEmbed(next);
    setMessage('Press play in the Spotify player.');
  }

  function loadFile(file?: File) {
    if (!file || !audio.current) return;
    audio.current.pause();
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    audio.current.src = objectUrl.current;
    audio.current.load();
    setFileName(file.name);
    setMessage('Your audio file stays on this device.');
  }

  return (
    <>
      <section id="guest-music" ref={section} className={`gb-music ${inline ? '' : 'gb-music-away'}`} aria-label="Your music">
        {inline && <div className="gb-music-story">
          <div className="gb-disc" aria-hidden="true" />
          <p className="gb-eyebrow">01 / The soundtrack</p>
          <h2>Your stay.<br /><em>Your music.</em></h2>
          <p>Your playlists. Your podcasts. Whatever’s already playing on your phone.</p>
          <Link className="gb-button" href="/guidebook/house?control=wifi">Get the Wi-Fi details ↗</Link>
        </div>}
        <div id="guest-music-panel" className={`gb-music-panel ${docked ? 'gb-player-floating' : ''}`}
          hidden={!inline && !docked} onKeyDown={event => {
            if (event.key === 'Escape' && docked) closePlayer();
          }}>
          {docked && <button ref={close} className="gb-player-close" onClick={closePlayer} aria-label="Close music controls">×</button>}
          <p className="gb-eyebrow">Listen your way</p>
          <div className="gb-tabs" aria-label="Music source">
            {[['app', 'Use my music app'], ['spotify', 'Spotify link'], ['file', 'Audio file']].map(([value, label]) => (
              <button key={value} type="button" aria-pressed={source === value} onClick={() => { setSource(value); setMessage(''); if (value === 'app') { audio.current?.pause(); setEmbed(null); } }}>{label}</button>
            ))}
          </div>
          <div hidden={source !== 'app'}>
            <p>Bring your playlists to the Lodge speakers. Keep using your own music account.</p>
            <label htmlFor="music-app">Your player</label>
            <div className="gb-control-row">
              <select id="music-app" value={player} onChange={event => { setPlayer(event.target.value); setConnection(event.target.value === 'Spotify' ? 'Spotify Connect' : 'Bluetooth'); }}>
                {Object.keys(players).map(name => <option key={name}>{name}</option>)}
              </select>
              {players[player] ? <a className="gb-button" href={players[player]} target="_blank" rel="noopener noreferrer">Open {player} ↗</a> : <span>Open your favorite audio app.</span>}
            </div>
            <label htmlFor="lodge-speaker">Your speaker</label>
            <div className="gb-control-row">
              <select id="lodge-speaker" value={speaker} onChange={event => setSpeaker(event.target.value)}>
                <option>Kendall Pond Echo</option>
                <option>Kendall Pond Deck Speakers</option>
              </select>
            </div>
            <div className="gb-tabs" aria-label="Connect your audio">
              {(player === 'Spotify' ? ['Spotify Connect', 'Bluetooth'] : ['Bluetooth']).map(method => <button key={method} type="button" aria-pressed={connection === method} onClick={() => setConnection(method)}>{method}</button>)}
            </div>
            <ol className="gb-speaker-steps">
              <li>{connection === 'Bluetooth' ? <>Go to <strong>{speaker}</strong> and say “Alexa, pair.”</> : <><Link href="/guidebook/house?control=wifi">Join the Lodge Wi-Fi</Link> on your phone.</>}</li>
              <li>{connection === 'Spotify Connect' ? 'Play something in the Spotify app. Tap the device icon in Now Playing.' : 'Open your phone’s Bluetooth settings. Select the nearby Echo; its Bluetooth name may differ.'}</li>
              <li>{connection === 'Bluetooth' ? 'Play from your music app. Disconnect Bluetooth when you’re done.' : <>Choose <strong>{speaker}</strong> if it appears. If it isn’t listed, try the Bluetooth steps above.</>}</li>
            </ol>
            <p className="gb-note">Your account stays in your app. This page cannot pair your phone or confirm playback.</p>
            <Link href="/guidebook/house?control=speaker">Speaker connection help ↗</Link>
          </div>
          <div hidden={source !== 'spotify'}>
            <p>Paste your own song, album, or playlist link to play it here.</p>
            <form onSubmit={loadSpotify} className="gb-music-input">
              <label className="gb-sr-only" htmlFor="spotify-link">Spotify share link</label>
              <input id="spotify-link" type="url" placeholder="https://open.spotify.com/…" required value={url} onChange={e => setUrl(e.target.value)} />
              <button className="gb-button" type="submit">Load player</button>
            </form>
            <p className="gb-note">Some tracks may play a short preview.</p>
            {embed && <>
              <iframe title="Your Spotify player" src={embed.url} height={embed.height}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
              <a href={embed.externalUrl} target="_blank" rel="noopener noreferrer">Open in Spotify ↗</a>
            </>}
          </div>
          <div hidden={source !== 'file'}>
            <p>Choose a song stored on your phone or computer.</p>
            <label htmlFor="guest-audio-file">Audio file</label>
            <input id="guest-audio-file" type="file" accept="audio/*" onChange={e => loadFile(e.target.files?.[0])} />
            {fileName && <p className="gb-note">{fileName}</p>}
            <audio ref={audio} controls preload="metadata" hidden={!fileName}
              onPlay={() => { setEmbed(null); setMessage('Playing from this device.'); }}
              onError={() => setMessage('This file could not play. Try an MP3 or another format your browser supports.')} />
          </div>
          <p className="gb-music-status" role="status">{message}</p>
        </div>
      </section>
      {hasMedia && (!inline || !visible) && !docked && (
        <div className="gb-music-dock">
          <span aria-hidden="true">♫</span>
          <div><strong>Your music</strong><small>Keep listening as you browse</small></div>
          <button ref={trigger} className="gb-button" onClick={openPlayer} aria-controls="guest-music-panel" aria-expanded={docked}>Open player</button>
        </div>
      )}
    </>
  );
}
