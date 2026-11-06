import Link from 'next/link';
import { guestHome } from '@/lib/guest-home.mjs';
import { requireMusicGuest } from '../(dashboard)/audio/access';
import { GuestWifi } from './GuestWifi';
import { GuestDevice } from './GuestDevice';
import { HouseGuide } from '@/app/_components/HouseGuide';

const tabs = [['wifi', 'Wi-Fi'], ['speaker', 'Speakers'], ['tv', 'TV'], ['climate', 'Temperature'], ['guide', 'House guide']];
export async function GuestHouse({ control = 'wifi' }: { control?: string }) {
  await requireMusicGuest();
  const selected = tabs.some(([key]) => key === control) ? control : 'wifi';
  const home = await guestHome().snapshot();
  const device = home.devices.find(item => item.key === selected);
  return <section className="gb-house-panel">
    <nav className="gb-house-tabs" aria-label="House controls">{tabs.map(([key, label]) => <Link key={key} href={`/guidebook/house?control=${key}`} aria-current={selected === key ? 'page' : undefined} scroll={false}>{label}</Link>)}</nav>
    {selected === 'wifi' && <GuestWifi ssid={process.env.KPL_GUEST_WIFI_SSID ?? ''} password={process.env.KPL_GUEST_WIFI_PASSWORD ?? ''} />}
    {selected === 'guide' && <HouseGuide privateGuide />}
    {device && <GuestDevice device={device} active={home.status === 'ready'} />}
    {device && home.status === 'outside_stay' && <p className="gb-note">Remote controls are available during your approved stay window.</p>}
    {selected === 'speaker' && <Link className="gb-button" href="/guidebook/audio">Choose your music app ↗</Link>}
  </section>;
}
