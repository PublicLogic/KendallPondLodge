'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { controlGuestHome } from '../(dashboard)/house/actions';
import type { guestHome } from '@/lib/guest-home.mjs';

type Device = Awaited<ReturnType<ReturnType<typeof guestHome>['snapshot']>>['devices'][number];
const labels = { speaker: 'Lodge speakers', tv: 'TV', climate: 'Room temperature' };
const fallback = { speaker: 'Use Kendall Pond Echo or Kendall Pond Deck Speakers. Choose your music app below for Spotify and Bluetooth connection steps.', tv: 'Use the Roku remote, or try the Roku mobile app on your phone.', climate: 'Use the wall thermostat, or message your host for help getting comfortable.' };

export function GuestDevice({ device, active }: { device: Device; active: boolean }) {
  const [message, action, pending] = useActionState(controlGuestHome, '');
  const ready = active && device.status === 'ready';
  const has = (name: string) => ready && device.actions.includes(name);
  return <article className="gb-home-card">
    <div className="gb-control-heading"><h3>{labels[device.key]}</h3><span className={`gb-device-status ${ready ? 'is-ready' : ''}`}>{ready ? 'Connected' : device.status === 'offline' ? 'Unavailable' : 'Not connected here'}</span></div>
    {ready ? <>
      <p className="gb-device-reading">{device.key === 'climate' ? <>{device.current ?? '—'}°{device.unit}<small>Room now · target {device.temperature ?? '—'}°{device.unit}</small></> : <>{device.state}<small>{device.volume === null ? 'Volume not reported' : `Volume ${device.volume}%`}</small></>}</p>
      <form action={action}>
        <input type="hidden" name="device" value={device.key} />
        <fieldset disabled={pending}>
          <div className="gb-control-row">{[['on', 'Turn on'], ['off', 'Turn off'], ['play', 'Resume'], ['pause', 'Pause']].filter(([command]) => has(command)).map(([command, label]) => <button className="gb-button" key={command} name="command" value={command}>{label}</button>)}</div>
        </fieldset>
      </form>
      {has('volume') && <form action={action}>
        <input type="hidden" name="device" value={device.key} /><input type="hidden" name="command" value="volume" />
        <fieldset disabled={pending}><label htmlFor={`${device.key}-volume`}>Volume · up to {device.max}%</label><div className="gb-control-row"><input key={device.volume} id={`${device.key}-volume`} name="value" type="number" inputMode="numeric" min="0" max={device.max} defaultValue={Math.min(device.volume ?? 20, device.max)} required /><button className="gb-button">Set volume</button></div></fieldset>
      </form>}
      {has('temperature') && <form action={action}>
        <input type="hidden" name="device" value={device.key} /><input type="hidden" name="command" value="temperature" />
        <fieldset disabled={pending}><label htmlFor="house-temperature">Target · {device.min}–{device.max}°{device.unit}</label><div className="gb-control-row"><input key={device.temperature} id="house-temperature" name="value" type="number" min={device.min} max={device.max} step="0.5" defaultValue={Math.max(device.min, Math.min(device.max, device.temperature ?? device.min))} required /><button className="gb-button">Set temperature</button></div></fieldset>
      </form>}
      {has('source') && <form action={action}>
        <input type="hidden" name="device" value={device.key} /><input type="hidden" name="command" value="source" />
        <fieldset disabled={pending}><label htmlFor="tv-source">TV input</label><div className="gb-control-row"><select id="tv-source" name="value" defaultValue={device.source}>{device.sources.map(source => <option key={source}>{source}</option>)}</select><button className="gb-button">Switch input</button></div></fieldset>
      </form>}
      {!device.actions.length && <p className="gb-note">This device isn’t reporting supported guest controls. Use its physical controls.</p>}
    </> : <>
      <p>{fallback[device.key]}</p>
      {device.key === 'tv' && <>
        <ol className="gb-speaker-steps">
          <li><Link href="/guidebook/house?control=wifi">Join the Lodge Wi-Fi</Link> on your phone.</li>
          <li><a href="https://www.roku.com/mobile-app" target="_blank" rel="noopener noreferrer">Get the Roku mobile app ↗</a> and allow local network access if prompted.</li>
          <li>In the app, select the Lodge’s Roku from Devices, then tap Remote.</li>
        </ol>
        <p className="gb-note">If it isn’t listed, use the physical remote. Phone power and volume controls depend on the Roku model.</p>
      </>}
    </>}
    <form action={action}><input type="hidden" name="device" value={device.key} /><button className="gb-text-button" name="command" value="refresh" disabled={pending}>Refresh status</button></form>
    <p role="status" className="gb-note">{pending ? 'Checking with the house…' : message}</p>
  </article>;
}
