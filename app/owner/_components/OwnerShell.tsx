"use client";
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
  return <div className="kpl-owner">
    <header className="kpl-owner-top">
      <Link href="/owner" className="kpl-owner-name">Kendall Pond Lodge <small>Owner workspace</small></Link>
      <Link href="/book" className="kpl-owner-preview">View booking page</Link>
    </header>
    <div className="kpl-owner-body">
      <aside className="kpl-owner-side">
        <nav aria-label="Owner workspace">
          {links.map(l=><Link key={l.href} href={l.href} aria-current={(l.href==="/owner"?path==="/owner":path===l.href||path.startsWith(l.href+"/"))?"page":undefined}>{l.label}</Link>)}
        </nav>
        <p className="kpl-owner-credit">One Lodge. Your controls.<span>PuddleJumper STAY · By PublicLogic</span></p>
      </aside>
      <div className="kpl-owner-content">{children}</div>
    </div>
    <nav className="kpl-owner-mobile" aria-label="Owner mobile navigation">
      {links.map(l=><Link key={l.href} href={l.href} aria-current={(l.href==="/owner"?path==="/owner":path===l.href||path.startsWith(l.href+"/"))?"page":undefined}>{l.label}</Link>)}
    </nav>
  </div>;
}
