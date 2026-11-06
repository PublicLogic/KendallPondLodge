'use client';

import { useState } from 'react';

export function GuestWifi({ ssid, password }: { ssid: string; password: string }) {
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState('');
  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setMessage(`${label} copied.`); }
    catch { setRevealed(true); setMessage('Select and copy the details below.'); }
  }
  return <article id="guest-wifi" className="gb-home-card gb-wifi">
    <p className="gb-eyebrow">Start here</p><h3>Get connected.</h3>
    {ssid && password ? <>
      <p className="gb-note">Join in your phone’s Wi-Fi settings.</p>
      <dl><dt>Network</dt><dd>{ssid}</dd><dt>Password</dt><dd className="gb-wifi-password">{revealed ? password : '••••••••••••'}</dd></dl>
      <div className="gb-control-row">
        <button type="button" className="gb-button" onClick={() => copy(password, 'Wi-Fi password')}>Copy password</button>
        <button type="button" className="gb-text-button" onClick={() => setRevealed(!revealed)} aria-pressed={revealed}>{revealed ? 'Hide' : 'Show'} password</button>
        <button type="button" className="gb-text-button" onClick={() => copy(ssid, 'Network name')}>Copy network</button>
      </div>
      <p role="status" className="gb-note">{message}</p>
    </> : <p>Your host can help with the Wi-Fi details.</p>}
  </article>;
}
