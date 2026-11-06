'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  { href: '/guidebook', label: 'Overview' },
  { href: '/guidebook/audio', label: 'Music' },
  { href: '/guidebook/arrival', label: 'Arrival' },
  { href: '/guidebook/house', label: 'House controls' },
  { href: '/guidebook/waterfront', label: 'Waterfront' },
  { href: '/guidebook/outside', label: 'Outside' },
  { href: '/guidebook/checkout', label: 'Checkout' },
];

function matches(pathname: string, href: string) {
  return pathname === href || (href !== '/guidebook' && pathname.startsWith(href + '/'));
}

export function guidebookSectionTitle(pathname: string) {
  return sections.find(section => matches(pathname, section.href))?.label ?? 'Guidebook';
}

export function GuidebookNav() {
  const pathname = usePathname();
  return (
    <nav className="gb-nav" aria-label="Guidebook sections">
      <div className="gb-frame">
        {sections.map(section => (
          <Link key={section.href} href={section.href} aria-current={matches(pathname, section.href) ? 'page' : undefined}>
            {section.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
