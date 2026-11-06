import { guestHome } from '@/lib/guest-home.mjs';
import { requireMusicGuest } from '../(dashboard)/audio/access';
import { GuestWifi } from './GuestWifi';
import { GuestDevice } from './GuestDevice';

export async function GuestHouse() {
  // Authenticate here as well as in the layout, before reading guest-only data.
  await requireMusicGuest();
  const home = await guestHome().snapshot();
  return <section id="house-controls" className="gb-section gb-house-controls">
    <p className="gb-eyebrow">Your house, for your stay</p><h2>Settle in. Make it yours.</h2>
    <p className="gb-home-intro">Wi-Fi, your music, and the comforts of the house. All in one place.</p>
    {home.status === 'outside_stay' && <p className="gb-note">Remote controls are available only during the host’s approved stay window.</p>}
    <div className="gb-home-grid">
      <GuestWifi ssid={process.env.KPL_GUEST_WIFI_SSID ?? ''} password={process.env.KPL_GUEST_WIFI_PASSWORD ?? ''} />
      {home.devices.map(device => <GuestDevice key={device.key} device={device} active={home.status === 'ready'} />)}
    </div>
    <p className="gb-note">{home.status === 'ready' ? 'Controls use the devices’ reported status. Refresh to check for changes.' : 'Remote house controls haven’t been connected for this stay. Your phone and the house remotes still work normally.'}</p>
  </section>;
}
