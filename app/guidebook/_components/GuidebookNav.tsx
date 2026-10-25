"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/app/_components/Icons";

type GuideSection = {
  href: string;
  label: string;
  icon: string;
  match?: readonly string[];
};

const sections: readonly GuideSection[] = [
  { href: "/guidebook", label: "Overview", icon: "home", match: ["/guidebook"] },
  { href: "/guidebook/arrival", label: "Arrival", icon: "arrival" },
  { href: "/guidebook/house", label: "House", icon: "house" },
  { href: "/guidebook/waterfront", label: "Waterfront", icon: "water" },
  { href: "/guidebook/outside", label: "Outside", icon: "outside" },
  { href: "/guidebook/audio", label: "Audio", icon: "audio" },
  { href: "/guidebook/checkout", label: "Checkout", icon: "checkout" },
] as const;

export function guidebookSectionTitle(pathname: string): string {
  const current = sections.find((section) =>
    (section.match ?? [section.href]).some((candidate) => pathname === candidate || pathname.startsWith(`${candidate}/`)),
  );

  return current?.label ?? "Guidebook";
}

export function GuidebookNav() {
  const pathname = usePathname();

  return (
    <nav className="guide-shell-nav" aria-label="Guidebook sections">
      <div className="guide-shell-nav-head">
        <p className="guide-dashboard-label">Sections</p>
        <strong>{guidebookSectionTitle(pathname)}</strong>
      </div>
      <div className="guide-shell-nav-links">
        {sections.map((section) => {
          const isActive = (section.match ?? [section.href]).some(
            (candidate) => pathname === candidate || pathname.startsWith(`${candidate}/`),
          );

          return (
            <Link
              key={section.href}
              className={`guide-shell-nav-link${isActive ? " is-active" : ""}`}
              href={section.href}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="icon-chip">
                <Icon name={section.icon} size={18} />
              </span>
              <span>{section.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
