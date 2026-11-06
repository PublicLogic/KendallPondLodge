import type { Metadata } from 'next';
import { homeAssistantMusic } from '@/lib/home-assistant-music.mjs';
import { requireMusicGuest } from './access';
import { MusicControls } from './MusicControls';

export const metadata: Metadata = { title: 'House Audio · Guidebook', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const speakerStatus: Record<string, string> = {
  playing: 'Playing',
  paused: 'Paused',
  idle: 'Ready',
  on: 'Ready',
  off: 'Standby',
  buffering: 'Buffering',
};

export default async function GuestbookAudioPage() {
  await requireMusicGuest();
  let speaker = null;
  try {
    speaker = await homeAssistantMusic()?.read() ?? null;
  } catch {
    // Bluetooth instructions remain available if the hub is down.
  }

  return (
    <div className="gb-section">
      {speaker && (
        <article className="audio-control" aria-labelledby="lodge-speaker-title">
          <p className="guide-dashboard-eyebrow">Play from the guidebook</p>
          <h2 id="lodge-speaker-title">Lodge speaker</h2>
          <p>Start the Lodge mix on the house speaker, pause it, or set a comfortable volume.</p>
          <div className="audio-output">
            <div>
              <small>Speaker status</small>
              <strong>{speakerStatus[speaker.state] ?? 'Unavailable'}</strong>
            </div>
            {speaker.volume != null && <div><small>Volume</small><strong>{speaker.volume}%</strong></div>}
          </div>
          <MusicControls state={speaker.state} volume={speaker.volume} />
        </article>
      )}
    </div>
  );
}
