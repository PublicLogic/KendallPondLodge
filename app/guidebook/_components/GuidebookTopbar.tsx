"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { guidebookSectionTitle } from "./GuidebookNav";

export function GuidebookTopbar() {
  const pathname = usePathname();

  return (
    <header className="guide-dashboard-topbar">
      <div className="guide-dashboard-title">
        <p className="guide-dashboard-eyebrow">Private Guidebook</p>
        <h1>{guidebookSectionTitle(pathname)}</h1>
      </div>
      <div className="guide-dashboard-topbar-actions">
        <Link className="guide-dashboard-home-link" href="/">
          Home
        </Link>
      </div>
    </header>
  );
}
