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
        <h2>Before you head home.</h2>
        <p>A few quick things before you go. Your reservation message has your confirmed checkout time and any stay-specific instructions.</p>
      </header>

      <section className="guide-section-stack">
        <SectionHeading eyebrow="Checkout list" title="Thanks for taking care of the place." />
        <ol className="checkout-list">
          {checkoutItems.map(([title, copy], index) => (
            <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{copy}</p></div></li>
          ))}
        </ol>
        <Notice><strong>Something broke or spilled?</strong> Just send us a quick message so we can take care of it. Thanks for staying with us.</Notice>
      </section>
    </div>
  );
}
