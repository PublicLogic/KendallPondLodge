import Link from "next/link";
import { mobileNavigation } from "@/app/_data/navigation";
import { Icon } from "./Icons";

export function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Quick navigation">
      {mobileNavigation.map((item) => (
        <Link href={item.href} key={item.href}>
          <Icon name={item.icon} size={20} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
