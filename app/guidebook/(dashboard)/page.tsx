import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { AskKendall } from '@/app/_components/AskKendall';
import { GuestScenes } from '../_components/GuestScenes';

export const metadata: Metadata = { title: 'Guestbook' };

const places = [
  { href: '/guidebook/waterfront', image: 'waterfront-dock.jpg', eyebrow: '01 / The waterfront', title: 'Down to the dock' },
  { href: '/guidebook/outside', image: 'hot-tub.jpg', eyebrow: '02 / Unwind', title: 'Hot tub time' },
  { href: '/guidebook/outside', image: 'fall-firepit.webp', eyebrow: '03 / After dark', title: 'By the fire' },
];

export default function GuidebookPage() {
  return (
    <>
      <section className="gb-section">
        <p className="gb-eyebrow">02 / The basics</p>
        <h2>Right when you need it.</h2>
        <div className="gb-essentials">
          <Link href="/guidebook/arrival"><strong>Arrival & parking ↗</strong><span>Find your way in</span></Link>
          <Link href="/guidebook/house"><strong>Get online ↗</strong><span>Wi-Fi, TV, and house essentials</span></Link>
          <Link href="/guidebook/checkout"><strong>Heading home ↗</strong><span>Your checkout checklist</span></Link>
        </div>
      </section>
      <section className="gb-section gb-search" aria-label="Search the guidebook"><AskKendall embedded /></section>
      <section className="gb-section">
        <p className="gb-eyebrow">03 / Make a day of it</p>
        <h2>A little closer to the pond.</h2>
        <div className="gb-places">
          {places.map(place => <Link key={place.title} href={place.href}>
            <Image src={'/images/kpl/' + place.image} alt="" width={600} height={400} sizes="(max-width: 700px) 90vw, 33vw" />
            <span><small>{place.eyebrow}</small><strong>{place.title} ↗</strong></span>
          </Link>)}
        </div>
      </section>
      <GuestScenes />
      <aside className="gb-help">
        <div><h2>Need a hand?</h2><p>Message us through your reservation if you need help with the house or your stay.</p></div>
        <div><strong>Immediate emergency</strong><p>Call 911 for fire, medical, or water emergencies.</p></div>
      </aside>
    </>
  );
}
