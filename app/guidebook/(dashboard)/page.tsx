import type { Metadata } from "next";
import Link from "next/link";

import { AskKendall } from "@/app/_components/AskKendall";
import { Icon } from "@/app/_components/Icons";

export const metadata: Metadata = {
  title: "Guidebook",
  description:
    "The private Lodge at Kendall Pond Guidebook for a confirmed guest stay.",
  robots: { index: false, follow: false },
};

const quickActions = [
  {
    icon: "arrival",
    kicker: "Getting here",
    title: "I’m arriving",
    href: "/guidebook/arrival",
    detail: "Entry, parking, codes and the first few minutes.",
  },
  {
    icon: "house",
    kicker: "Inside",
    title: "Settle into the house",
    href: "/guidebook/house",
    detail: "Wi-Fi, TV, kitchen and keeping comfortable.",
  },
  {
    icon: "outside",
    kicker: "Relax",
    title: "Use the hot tub",
    href: "/guidebook/outside",
    detail: "Hot tub, fire pit, pool and outside spaces.",
  },
  {
    icon: "water",
    kicker: "Kendall Pond",
    title: "Head to the water",
    href: "/guidebook/waterfront",
    detail: "Dock, kayaks, paddle boat and pond safety.",
  },
  {
    icon: "audio",
    kicker: "Around the Lodge",
    title: "Play some music",
    href: "/guidebook/audio",
    detail: "House audio and device controls.",
  },
  {
    icon: "checkout",
    kicker: "Heading home",
    title: "I’m checking out",
    href: "/guidebook/checkout",
    detail: "A simple final walkthrough before you leave.",
  },
] as const;

export default function GuidebookPage() {
  return (
    <section
      className="guide-command-center"
      aria-label="Guest Guidebook dashboard"
    >
      <article className="guide-command-hero">
        <div className="guide-command-copy">
          <p className="guide-dashboard-label">Your stay command center</p>
          <h2>What do you need?</h2>
          <p>
            Get the answer quickly, then get back to enjoying the Lodge.
          </p>
        </div>

        <AskKendall embedded />
      </article>

      <div className="guide-command-actions">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            className="guide-command-action"
            href={action.href}
          >
            <span className="guide-command-action-icon">
              <Icon name={action.icon} size={22} />
            </span>

            <span className="guide-command-action-copy">
              <small>{action.kicker}</small>
              <strong>{action.title}</strong>
              <span>{action.detail}</span>
            </span>

            <Icon name="arrow" size={18} />
          </Link>
        ))}
      </div>

      <aside className="guide-command-help">
        <div>
          <p className="guide-dashboard-label">Need a person?</p>
          <strong>We’re here if the guide isn’t enough.</strong>
          <p>
            Message Nate &amp; Allie through your latest reservation message
            for house or stay help.
          </p>
        </div>

        <div className="guide-command-emergency">
          <small>Immediate safety</small>
          <strong>Call 911</strong>
          <span>Fire · medical · water emergency</span>
        </div>
      </aside>
    </section>
  );
}
