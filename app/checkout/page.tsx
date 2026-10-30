import type { Metadata } from "next";
import { Notice, SectionHeading } from "@/app/_components/Content";

export const metadata: Metadata = { title: "Checkout", description: "A clear before-you-leave checklist for Kendall Pond." };

const checkoutItems = [
  ["Bring it back", "Return boats, paddles, life jackets, outdoor items, and house equipment to their designated places."],
  ["Close it up", "Secure the hot-tub cover, close windows and doors, and make sure outdoor areas are safe."],
  ["Take your things", "Check drawers, outlets, bathrooms, the refrigerator, bedrooms, and charging areas."],
  ["Sign out", "Sign out of personal television, music, and streaming accounts on every device you used."],
  ["Report what needs attention", "Message the hosts about damage, spills, missing items, or anything that should be handled before the next stay."],
  ["Use the confirmed time", "Follow the checkout time and any stay-specific instructions in your latest reservation message."],
];

export default function CheckoutPage() {
  return (
    <div className="guide-section-page">
      <header className="guide-section-header">
        <p className="guide-dashboard-eyebrow">Before you leave</p>
        <h2>A clean finish to the stay.</h2>
        <p>Six straightforward checks. Your booking message remains the source for the confirmed checkout time and any reservation-specific requests.</p>
      </header>

      <section className="guide-section-stack">
        <SectionHeading eyebrow="Checkout list" title="Leave it ready for the next quiet morning." />
        <ol className="checkout-list">
          {checkoutItems.map(([title, copy], index) => (
            <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{copy}</p></div></li>
          ))}
        </ol>
        <Notice><strong>Do not guess about damage.</strong> A short, early message is the fastest way to get the right help and prepare the property safely.</Notice>
      </section>
    </div>
  );
}
