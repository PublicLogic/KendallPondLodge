'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { lockGuidebook } from '@/app/guidebook/access/actions';
import { GuestMusic } from './GuestMusic';
import { GuidebookNav } from './GuidebookNav';

export function GuidebookShell({ children }: { children: ReactNode }) {
  const home = usePathname() === '/guidebook';
  return (
    <div className="gb-app">
      <a className="skip-link" href="#main-content">Skip to Guidebook</a>
      <header className="gb-mast"><div className="gb-frame">
        <Link href="/guidebook" className="gb-brand">
          <Image src="/images/kpl/lodge-seal.png" width={48} height={48} alt="" />
          <span>The Lodge<small>AT KENDALL POND</small></span>
        </Link>
        <form action={lockGuidebook}><button type="submit" className="gb-signout">Close guidebook</button></form>
      </div></header>
      <GuidebookNav />
      <main id="main-content">
        {home && <section className="gb-hero">
          <Image src="/images/kpl/fall-pond.webp" alt="Fall colors along Kendall Pond" fill priority sizes="100vw" />
          <div className="gb-frame">
            <p className="gb-eyebrow">The guestbook · Gardner, Massachusetts</p>
            <h1>Make yourself<br /><em>at home.</em></h1>
            <p>Put on your music, head down to the pond, or find the one thing you need right now.</p>
            <a href="#guest-music" className="gb-button">♫ Play your music ↗</a>
          </div>
        </section>}
        <div className="gb-frame gb-content">
          <GuestMusic />
          {children}
        </div>
      </main>
      <footer className="gb-footer"><div className="gb-frame">
        <Link href="/">The Lodge at Kendall Pond</Link>
        <span>Your private guestbook</span>
        <a href="#main-content">Back to top ↑</a>
      </div></footer>
    </div>
  );
}
