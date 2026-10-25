import Link from "next/link";
import { Brand } from "./Brand";
import { StayOsFooterMark } from "./StayOsFooterMark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-brand">
        <Brand />
        <p>The private Guidebook for the house, waterfront, and an active stay.</p>
      </div>
      <div style={{ display: "grid", gap: "0.75rem", justifyItems: "end" }}>
        <div className="footer-links">
          <Link href="/guidebook#ask-kendall">Ask Kendall</Link>
          <Link href="/guidebook/checkout">Checkout</Link>
          <Link href="/">Home</Link>
          <Link href="/remote">Remote</Link>
        </div>
        <p className="site-footer-est">The Lodge at Kendall Pond · Gardner, MA</p>
        <StayOsFooterMark />
      </div>
    </footer>
  );
}
