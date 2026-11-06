'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { spotifyEmbed } from '@/lib/spotify-embed.mjs';

export function GuestMusic() {
  const pathname = usePathname();
  const inline = pathname === '/guidebook' || pathname === '/guidebook/audio';
  const section = useRef<HTMLElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const objectUrl = useRef<string | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const [source, setSource] = useState('spotify');
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
          <p>Bring the songs you already love. Choose your music and pair your phone with the Lodge speaker.</p>
        </div>}
        <div id="guest-music-panel" className={`gb-music-panel ${docked ? 'gb-player-floating' : ''}`}
          hidden={!inline && !docked} onKeyDown={event => {
            if (event.key === 'Escape' && docked) closePlayer();
          }}>
          {docked && <button ref={close} className="gb-player-close" onClick={closePlayer} aria-label="Close music controls">×</button>}
          <p className="gb-eyebrow">Listen your way</p>
          <div className="gb-tabs" aria-label="Music source">
            {[['spotify', 'Spotify'], ['file', 'My audio file'], ['speaker', 'Lodge speaker']].map(([value, label]) => (
              <button key={value} type="button" aria-pressed={source === value} onClick={() => { setSource(value); setMessage(''); }}>{label}</button>
            ))}
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
          <div hidden={source !== 'speaker'}>
            <ol className="gb-speaker-steps">
              <li>Open Bluetooth settings on your phone or laptop.</li>
              <li>Pair with the Lodge speaker. Ask your host if you need help putting it in pairing mode.</li>
              <li>Choose it as your device’s output, then play music here or in your own app.</li>
            </ol>
            <p className="gb-note">The player uses the audio output selected on your device.</p>
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
