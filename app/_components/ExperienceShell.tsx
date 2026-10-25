"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { publicNavigation } from "@/app/_data/navigation";
import { AskKendall } from "./AskKendall";
import { Brand } from "./Brand";
import { MobileNav } from "./MobileNav";
import { PublicMobileNav } from "./PublicMobileNav";
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

function ExperienceHeader({
  mode,
  bookEnabled,
}: {
  mode: "booking" | "access";
  bookEnabled: boolean;
}) {
  const label = mode === "booking" ? "Property" : "Guidebook access";
  const pathname = usePathname();

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className={`experience-header experience-header-${mode}`}>
        <div className="experience-header-inner">
          <Brand />

          {mode === "booking" ? (
            <>
              <nav className="experience-nav" aria-label={`${label} navigation`}>
                {publicNavigation.map((item) => {
                  const current =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                  return (
                    <Link
                      href={item.href}
                      key={item.href}
                      aria-current={current ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <Link
                className="experience-book-button"
                href={bookEnabled ? "/book" : "/rates"}
              >
                {bookEnabled ? "Book your stay" : "Check dates"}
              </Link>
            </>
          ) : (
            <nav className="experience-nav" aria-label={`${label} navigation`}>
              <Link href="/">Home</Link>
            </nav>
          )}
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
          {mode === "booking" && "A private waterfront lodge in Gardner, Massachusetts."}
          {mode === "access" && "Reserved for confirmed guests."}
        </p>
      </div>

      <div style={{ display: "grid", gap: "0.75rem", justifyItems: "end" }}>
        <div className="footer-links">
          <Link href="/guidebook">Already booked? Guest Guide</Link>
          <Link className="footer-owner-link" href="/owner">Owner login</Link>
        </div>
        <p className="site-footer-est">The Lodge at Kendall Pond · Gardner, MA</p>
        <StayOsFooterMark inverse />
      </div>
    </footer>
  );
}

export function ExperienceShell({
  children,
  bookEnabled,
}: {
  children: ReactNode;
  bookEnabled: boolean;
}) {
  const pathname = usePathname();
  const isOwner = pathname === "/owner" || pathname.startsWith("/owner/");
  const isGuidebook =
    pathname.startsWith("/guidebook") || legacyGuidePaths.has(pathname);
  const isAccess = pathname.startsWith("/guidebook/access");

  if (isOwner) return <>{children}</>;

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
      <PublicMobileNav bookEnabled={bookEnabled} />
    </>
  );
}
