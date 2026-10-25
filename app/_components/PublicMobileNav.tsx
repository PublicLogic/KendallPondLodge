"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicMobileNav({ bookEnabled }: { bookEnabled: boolean }) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home" },
    { href: "/lodge", label: "Lodge" },
    { href: bookEnabled ? "/book" : "/rates", label: bookEnabled ? "Book" : "Rates", primary: true },
    { href: "/explore", label: "Explore" },
    { href: "/guidebook", label: "Guide" },
  ];

  return (
    <nav className="public-mobile-nav" aria-label="Property navigation">
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={item.primary ? "public-mobile-nav-primary" : undefined}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
