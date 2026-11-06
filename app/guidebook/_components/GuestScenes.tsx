'use client';

import { useState } from 'react';

const scenes = [
  { name: 'Arriving', brightness: 85 },
  { name: 'Movie night', brightness: 20 },
  { name: 'Porch evening', brightness: 55 },
];

export function GuestScenes() {
  const [brightness, setBrightness] = useState(0);
  const [scene, setScene] = useState('');
  const [previous, setPrevious] = useState(55);
  function setLamp(level: number, name = '') {
    if (level > 0) setPrevious(level);
    setBrightness(level);
    setScene(name);
  }
  return (
    <section className="gb-scenes" aria-labelledby="scene-title">
      <div>
        <p className="gb-eyebrow">Try the lighting concept · Simulated lamp</p>
        <h2 id="scene-title">Set the mood.</h2>
        <p>Explore a scene and adjust the demo lamp.</p>
        <div className="gb-tabs">
          {scenes.map(item => <button key={item.name} aria-pressed={scene === item.name}
            onClick={() => setLamp(item.brightness, item.name)}>{item.name}</button>)}
        </div>
        <div className="gb-lamp-controls">
          <button className="gb-button" onClick={() => setLamp(brightness ? 0 : previous)}>Turn lamp {brightness ? 'off' : 'on'}</button>
          <label htmlFor="demo-brightness">Brightness</label>
          <input id="demo-brightness" type="range" min="0" max="100" value={brightness} onChange={e => setLamp(Number(e.target.value))} />
        </div>
      </div>
      <div className="gb-scene-room">
        <div className="gb-lamp-glow" style={{ opacity: brightness / 100 }} aria-hidden="true" />
        <div className="gb-lamp-shade" aria-hidden="true" />
        <div className="gb-lamp-base" aria-hidden="true" />
        <p role="status"><small>Demo lamp</small> {brightness ? `${scene || 'On'} · ${brightness}%` : 'Off'}</p>
      </div>
    </section>
  );
}
