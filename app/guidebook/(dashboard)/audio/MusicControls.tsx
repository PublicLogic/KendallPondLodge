'use client';

import { useActionState } from 'react';
import { controlLodgeMusic } from './actions';

export function MusicControls({ state, volume }: { state: string; volume: number | null }) {
  const [result, action, pending] = useActionState(controlLodgeMusic, '');
  const available = state !== 'unavailable' && state !== 'unknown';
  return (
    <form action={action}>
      <div className="audio-buttons">
        <button className="button button-primary" name="command" value="start" formNoValidate disabled={pending || !available}>
          Play Lodge mix
        </button>
        {state === 'playing' && (
          <button className="button button-secondary" name="command" value="pause" formNoValidate disabled={pending}>Pause</button>
        )}
        {state === 'paused' && (
          <button className="button button-secondary" name="command" value="play" formNoValidate disabled={pending}>Resume</button>
        )}
        <button className="button button-secondary" name="command" value="refresh" formNoValidate disabled={pending}>Refresh status</button>
      </div>
      {available && volume !== null && (
        <>
          <label htmlFor="lodge-speaker-volume">Set volume (0–50%)</label>{' '}
          <input
            key={volume}
            id="lodge-speaker-volume"
            type="number"
            name="volume"
            min={0}
            max={50}
            step={1}
            defaultValue={Math.min(volume, 50)}
            required
          />{' '}
          <button className="button button-secondary" name="command" value="volume" disabled={pending}>
            Set volume
          </button>
        </>
      )}
      <p className="audio-status" role="status">{pending ? 'Checking the Lodge speaker…' : result}</p>
    </form>
  );
}
