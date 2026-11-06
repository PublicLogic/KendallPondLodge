import Image from 'next/image';
import Link from 'next/link';
import type { guestHome } from '@/lib/guest-home.mjs';

type Home = Awaited<ReturnType<ReturnType<typeof guestHome>['snapshot']>>;
const guides = [
  ['arrival', 'Arrival', '↗'], ['house?control=guide', 'House guide', '⌂'],
  ['waterfront', 'The pond', '≈'], ['outside', 'Outside', '☼'],
  ['checkout', 'Checkout', '✓'], ['help', 'Search', '?'],
];

export function ControlDashboard({ home, network }: { home: Home; network: string }) {
  const device = (key: string) => home.devices.find(item => item.key === key);
  const ready = (key: string) => home.status === 'ready' && device(key)?.status === 'ready';
  const climate = device('climate');
  return <div className="gb-dashboard">
    <div className="gb-dashboard-heading"><div><p className="gb-eyebrow">The guestbook · Kendall Pond</p><h1>Make yourself at home.</h1></div><span className="gb-stay-label">Your stay. Your space.</span></div>
    <div className="gb-dashboard-workspace">
      <aside className="gb-pond-card">
        <Image src="/images/kpl/fall-pond.webp" alt="Autumn on Kendall Pond" fill priority sizes="(max-width: 800px) 1px, 35vw" />
        <div><p className="gb-eyebrow">A little time by the water</p><h2>Settle in.<br /><em>Stay awhile.</em></h2><p>Everything you need is right here.</p><Link href="/guidebook/waterfront">Down to the pond <span>↗</span></Link></div>
      </aside>
      <section className="gb-dashboard-controls" aria-label="Your stay controls">
        <Link className="gb-sound-tile" href="/guidebook/audio"><span className="gb-sound-symbol" aria-hidden="true">♫</span><div><span className="gb-eyebrow">The soundtrack is yours</span><h2>Play your music.</h2><p>Spotify · Apple Music · Your favorite player</p></div><span className="gb-open-control" aria-hidden="true">↗</span></Link>
        <div className="gb-control-tiles">
          <Link className="gb-control-tile gb-network-tile" href="/guidebook/house?control=wifi"><span className="gb-tile-icon" aria-hidden="true">⌁</span><span className="gb-tile-state">Ready to join</span><h2>Wi-Fi</h2><p>{network || 'Get connected'}</p><span className="gb-tile-action">Show or copy password <b aria-hidden="true">↗</b></span></Link>
          <Link className="gb-control-tile" href="/guidebook/house?control=speaker"><span className="gb-tile-icon" aria-hidden="true">♫</span><span className={`gb-tile-state ${ready('speaker') ? 'is-ready' : ''}`}>{ready('speaker') ? 'Connected' : 'Setup needed'}</span><h2>Speakers</h2><p>{ready('speaker') ? `Volume ${device('speaker')?.volume ?? '—'}%` : 'Bring your own soundtrack'}</p><span className="gb-tile-action">{ready('speaker') ? 'Playback & volume' : 'Connection help'} <b aria-hidden="true">↗</b></span></Link>
          <Link className="gb-control-tile" href="/guidebook/house?control=tv"><span className="gb-tile-icon gb-tv-symbol" aria-hidden="true">▭</span><span className={`gb-tile-state ${ready('tv') ? 'is-ready' : ''}`}>{ready('tv') ? 'Connected' : 'Use the remote'}</span><h2>TV</h2><p>{ready('tv') ? device('tv')?.state : 'Your shows. Your downtime.'}</p><span className="gb-tile-action">{ready('tv') ? 'Power, input & volume' : 'TV & casting help'} <b aria-hidden="true">↗</b></span></Link>
          <Link className="gb-control-tile" href="/guidebook/house?control=climate"><span className="gb-tile-icon" aria-hidden="true">°</span><span className={`gb-tile-state ${ready('climate') ? 'is-ready' : ''}`}>{ready('climate') ? 'Connected' : 'Wall thermostat'}</span><h2>{ready('climate') ? `${climate?.current ?? '—'}°${climate?.unit}` : 'Comfort'}</h2><p>{ready('climate') ? `Target ${climate?.temperature ?? '—'}°${climate?.unit}` : 'Make the room feel right'}</p><span className="gb-tile-action">Temperature <b aria-hidden="true">↗</b></span></Link>
        </div>
      </section>
    </div>
    <nav className="gb-experience-nav" aria-label="Explore your stay">{guides.map(([path, title, symbol]) => <Link key={path} href={`/guidebook/${path}`}><span aria-hidden="true">{symbol}</span><strong>{title}</strong></Link>)}</nav>
  </div>;
}
