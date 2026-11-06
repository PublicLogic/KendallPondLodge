'use client';

import { useEffect, useState } from 'react';

const items = [
  ['equipment', 'Bring it back', 'Return boats, paddles, life jackets, outdoor items, and house equipment to their designated places.'],
  ['secure', 'Close it up', 'Secure the hot-tub cover, close windows and doors, and make sure outdoor areas are safe.'],
  ['belongings', 'Take your things', 'Check drawers, outlets, bathrooms, the refrigerator, bedrooms, and charging areas.'],
  ['accounts', 'Sign out', 'Sign out of personal television, music, and streaming accounts on every device you used.'],
  ['report', 'Report what needs attention', 'Message the hosts about damage, spills, missing items, or anything that needs attention.'],
  ['time', 'Use the confirmed time', 'Follow the checkout time and stay-specific instructions in your latest reservation message.'],
];
const key = 'kpl-guest-checkout-v1';

export function CheckoutChecklist() {
  const [checked, setChecked] = useState<string[]>([]);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(key) ?? '[]');
      if (Array.isArray(saved)) setChecked(saved.filter(id => items.some(item => item[0] === id)));
    } catch { /* Storage may be disabled. */ }
  }, []);
  function update(values: string[]) {
    setChecked(values);
    try { sessionStorage.setItem(key, JSON.stringify(values)); } catch { /* Keep in-memory progress. */ }
  }
  return (
    <section className="gb-checkout">
      <p role="status">{checked.length} of {items.length} checked</p>
      <progress aria-label="Checkout progress" value={checked.length} max={items.length} />
      <fieldset>
        <legend className="gb-sr-only">Checkout checklist</legend>
        {items.map(([id, title, detail]) => <label key={id}>
          <input type="checkbox" checked={checked.includes(id)} onChange={e => update(e.target.checked ? [...checked, id] : checked.filter(value => value !== id))} />
          <span><strong>{title}</strong><small>{detail}</small></span>
        </label>)}
      </fieldset>
      <button className="gb-text-button" onClick={() => update([])}>Reset checklist</button>
    </section>
  );
}
