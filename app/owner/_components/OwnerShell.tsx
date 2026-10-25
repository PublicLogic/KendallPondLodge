"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const links = [
  {href:"/owner",label:"Overview"},
  {href:"/owner/bookings",label:"Bookings"},
  {href:"/owner/availability",label:"Availability"},
  {href:"/owner/settings",label:"Settings"},
];

export function OwnerShell({children}:{children:ReactNode}) {
  const path=usePathname();
  if(path.startsWith("/owner/access")) return <>{children}</>;

  const active=(href:string)=>href==="/owner"?path==="/owner":path===href||path.startsWith(href+"/");

  return <div className="kpl-owner">
    <header className="kpl-owner-top">
      <Link href="/owner" className="kpl-owner-logo" aria-label="PuddleJumper owner workspace for Lodge at Kendall Pond">
        <Image
          src="/brand/stay/puddlejumper-beta.png"
          alt="PuddleJumper Beta"
          width={1488}
          height={342}
          priority
        />
      </Link>

      <div className="kpl-owner-property">
        <Image
          src="/images/kpl/lodge-seal.png"
          alt="The Lodge at Kendall Pond"
          width={512}
          height={512}
        />
        <span>Lodge at Kendall Pond</span>
      </div>

      <Link href="/book" className="kpl-owner-preview">Preview booking</Link>
    </header>

    <div className="kpl-owner-body">
      <aside className="kpl-owner-side">
        <nav aria-label="Owner workspace">
          {links.map(l=><Link key={l.href} href={l.href} aria-current={active(l.href)?"page":undefined}>{l.label}</Link>)}
        </nav>
        <div className="kpl-owner-credit">
          <strong>One Lodge. Your controls.</strong>
          <Image
            src="/brand/stay/puddlejumper-stay.png"
            alt="PuddleJumper STAY — Lodging and hospitality"
            width={401}
            height={422}
          />
          <span>By PublicLogic</span>
        </div>
      </aside>

      <div className="kpl-owner-content">{children}</div>
    </div>

    <nav className="kpl-owner-mobile" aria-label="Owner mobile navigation">
      {links.map(l=><Link key={l.href} href={l.href} aria-current={active(l.href)?"page":undefined}>{l.label}</Link>)}
    </nav>
  </div>;
}
