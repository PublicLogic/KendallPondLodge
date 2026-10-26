"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { publicNavigation } from "@/app/_data/navigation";
import { Brand } from "./Brand";
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

function PublicHeader({
  bookEnabled,
}: {
  bookEnabled: boolean;
}) {
  const pathname = usePathname();

  const current = (href: string) =>
    pathname === href ||
    (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="experience-header experience-header-booking hospitality-header">
        <div className="experience-header-inner">
          <Brand />

          <nav
            className="experience-nav hospitality-nav"
            aria-label="Property navigation"
          >
            {publicNavigation.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                aria-current={current(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <details className="hospitality-menu">
            <summary>Menu</summary>

            <nav aria-label="Property menu">
              {publicNavigation.map((item) => (
                <Link
                  href={item.href}
                  key={item.href}
                  aria-current={current(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>

          <Link
            className="experience-book-button hospitality-book-button"
            href={bookEnabled ? "/book" : "/rates"}
          >
            {bookEnabled ? "Check dates" : "See rates"}
          </Link>
        </div>
      </header>
    </>
  );
}

function PublicFooter() {
  return (
    <footer className="experience-footer hospitality-footer">
      <div className="site-footer-brand">
        <Brand />
        <p>
          Private waterfront on Kendall Pond · Gardner, Massachusetts
        </p>
      </div>

      <div className="hospitality-footer-right">
        <div className="footer-links">
          <Link href="/guidebook">Guest Guide</Link>
          <Link className="footer-owner-link" href="/owner">
            Owner
          </Link>
        </div>

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

  const isOwner =
    pathname === "/owner" ||
    pathname.startsWith("/owner/");

  const isGuidebook =
    pathname.startsWith("/guidebook") ||
    legacyGuidePaths.has(pathname);

  const isGuidebookAccess =
    pathname.startsWith("/guidebook/access");

  if (isOwner) {
    return <>{children}</>;
  }

  /*
   * Both the access gate and authenticated Guidebook own their whole
   * viewport. Never wrap them in the public property website.
   */
  if (isGuidebookAccess || isGuidebook) {
    return <>{children}</>;
  }

  return (
    <>
      <PublicHeader bookEnabled={bookEnabled} />
      {children}
      <PublicFooter />
    </>
  );
}
