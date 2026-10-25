"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { publicNavigation } from "@/app/_data/navigation";
import { AskKendall } from "./AskKendall";
import { Brand } from "./Brand";
import { MobileNav } from "./MobileNav";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { StayOsFooterMark } from "./StayOsFooterMark";

const legacyGuidePaths = new Set([
  "/house-guide",
  "/help",
  "/arrival",
  "/house",
  "/waterfront",
  "/outside",
  "/audio",
  "/checkout",
]);

function ExperienceHeader({ mode, bookEnabled }: { mode: "booking" | "access"; bookEnabled: boolean }) {
  const label = mode === "booking" ? "Booking" : "Guidebook access";

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className={`experience-header experience-header-${mode}`}>
        <div className="experience-header-inner">
          <Brand />
          <nav className="experience-nav" aria-label={`${label} navigation`}>
            {mode === "booking"
              ? publicNavigation.filter((item) => bookEnabled || item.href !== "/book").map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)
              : <Link href="/">Home</Link>}
          </nav>
        </div>
      </header>
    </>
  );
}

function ExperienceFooter({ mode }: { mode: "booking" | "access" }) {
  return (
    <footer className="experience-footer">
      <div className="site-footer-brand">
        <Brand />
        <p>
          {mode === "booking" && "Waterfront in Gardner, Massachusetts."}
          {mode === "access" && "Reserved for confirmed guests."}
        </p>
      </div>
      <div style={{ display: "grid", gap: "0.75rem", justifyItems: "end" }}>
        <div className="footer-links">
          <Link href="/guidebook">Already booked? Guidebook</Link>
          <Link className="footer-owner-link" href="/owner">Owner login</Link>
        </div>
        <p className="site-footer-est">The Lodge at Kendall Pond · Gardner, MA</p>
        <StayOsFooterMark inverse />
      </div>
    </footer>
  );
}

export function ExperienceShell({ children, bookEnabled }: { children: ReactNode; bookEnabled: boolean }) {
  const pathname = usePathname();
  const isGuidebook = pathname.startsWith("/guidebook") || legacyGuidePaths.has(pathname);
  const isAccess = pathname.startsWith("/guidebook/access");

  if (isAccess) {
    return (
      <>
        <ExperienceHeader mode="access" bookEnabled={bookEnabled} />
        {children}
        <ExperienceFooter mode="access" />
      </>
    );
  }

  if (isGuidebook) {
    return (
      <>
        <SiteHeader />
        {children}
        <SiteFooter />
        <AskKendall />
        <MobileNav />
      </>
    );
  }

  return (
    <>
      <ExperienceHeader mode="booking" bookEnabled={bookEnabled} />
      {children}
      <ExperienceFooter mode="booking" />
    </>
  );
}
