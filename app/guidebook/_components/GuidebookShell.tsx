'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { lockGuidebook } from '@/app/guidebook/access/actions';
import { GuestMusic } from './GuestMusic';

const titles: Record<string, string> = { audio: 'Your music', house: 'House controls', arrival: 'Arrival', waterfront: 'The pond', outside: 'Hot tub & outside', checkout: 'Checkout', help: 'Find something' };

export function GuidebookShell({ children, dashboard }: { children: ReactNode; dashboard: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const back = useRef<HTMLAnchorElement>(null);
  const open = pathname !== '/guidebook';
  const music = pathname === '/guidebook/audio';
  const title = titles[pathname.split('/')[2]] ?? 'Your guide';

  useEffect(() => {
    const panel = dialog.current;
    if (open && panel && !panel.open) { panel.showModal(); back.current?.focus(); }
    if (!open && panel?.open) panel.close();
  }, [open]);

  return <div className="gb-app gb-dashboard-app">
    <a className="skip-link" href="#main-content">Skip to controls</a>
    <header className="gb-mast"><div className="gb-dashboard-mast">
      <Link href="/guidebook" className="gb-brand"><Image src="/images/kpl/lodge-seal.png" width={40} height={40} alt="" /><span>The Lodge<small>AT KENDALL POND</small></span></Link>
      <div className="gb-mast-actions"><Link href="/guidebook/help">Need a hand?</Link><form action={lockGuidebook}><button type="submit" className="gb-signout">Close guidebook</button></form></div>
    </div></header>
    <main id="main-content" className="gb-dashboard-main">{dashboard}</main>
    <dialog ref={dialog} className="gb-control-dialog" aria-labelledby="guest-panel-title" onCancel={event => { event.preventDefault(); router.push('/guidebook', { scroll: false }); }}>
      <header className="gb-panel-heading"><div><p className="gb-eyebrow">Your stay controls</p><h2 id="guest-panel-title">{title}</h2></div><Link ref={back} className="gb-panel-back" href="/guidebook" scroll={false}>Back to dashboard <span aria-hidden="true">×</span></Link></header>
      <div className="gb-panel-content">
        <div hidden={!music}><GuestMusic /></div>
        {!music && children}
      </div>
    </dialog>
  </div>;
}
