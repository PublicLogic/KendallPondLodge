import Link from "next/link";
import { primaryNavigation } from "@/app/_data/navigation";
import { Brand } from "./Brand";

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="site-header-inner">
          <Brand />
          <span className="experience-product-label">Guidebook</span>
          <nav className="desktop-nav" aria-label="Guidebook navigation">
            {primaryNavigation.map((item) => (
              <Link href={item.href} key={item.href}>{item.label}</Link>
            ))}
          </nav>
          <Link className="tools-link" href="/">Exit to home</Link>
        </div>
      </header>
      <div className="privacy-strip">
        Private Guidebook · stay-specific codes, confirmed times, and contact details remain in the booking message.
      </div>
    </>
  );
}
