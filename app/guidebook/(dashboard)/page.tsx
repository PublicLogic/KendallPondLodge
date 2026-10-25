import type { Metadata } from "next";
import Link from "next/link";
import { AskKendall } from "@/app/_components/AskKendall";
import { Icon } from "@/app/_components/Icons";

export const metadata: Metadata = {
  title: "Guidebook",
  description: "The private Lodge at Kendall Pond Guidebook for a confirmed guest stay.",
  robots: { index: false, follow: false },
};

const guideSections = [
  { icon: "arrival", title: "Arrival & entry", href: "/guidebook/arrival", detail: "Codes, parking, first steps" },
  { icon: "house", title: "House essentials", href: "/guidebook/house", detail: "Wi-Fi, TV, comfort, kitchen" },
  { icon: "water", title: "Waterfront", href: "/guidebook/waterfront", detail: "Pond use and safety" },
  { icon: "outside", title: "Hot tub & outside", href: "/guidebook/outside", detail: "Tub, fire pit, pool" },
  { icon: "audio", title: "House audio", href: "/guidebook/audio", detail: "Play through house speaker" },
  { icon: "checkout", title: "Checkout", href: "/guidebook/checkout", detail: "Final walkthrough" },
] as const;

const goodToKnow = [
  {
    title: "Reservation message",
    detail: "Use your latest message for the address, code, Wi-Fi, times, and host contact info.",
  },
  {
    title: "Help path",
    detail: "Message the hosts for property help. Call 911 for fire, medical, water, or immediate safety emergencies.",
  },
] as const;

export default function GuidebookPage() {
  return (
    <section className="guide-dashboard-grid" aria-label="Guidebook dashboard">
      <article className="guide-dashboard-panel guide-dashboard-panel-search">
        <div className="guide-dashboard-panel-head">
          <p className="guide-dashboard-label">Guide search</p>
          <h2>Ask Kendall</h2>
          <p>Quick answers from this guide.</p>
        </div>
        <AskKendall embedded />
      </article>

      <div className="guide-dashboard-section-grid">
        {guideSections.map((section) => (
          <Link key={section.href} className="guide-dashboard-tile" href={section.href}>
            <span className="icon-chip">
              <Icon name={section.icon} size={20} />
            </span>
            <div>
              <strong>{section.title}</strong>
              <span>{section.detail}</span>
            </div>
            <Icon name="arrow" size={18} />
          </Link>
        ))}
      </div>

      <aside className="guide-dashboard-panel guide-dashboard-panel-notes">
        <div className="guide-dashboard-panel-head">
          <p className="guide-dashboard-label">Good to know</p>
          <h2>Keep these handy</h2>
        </div>
        <div className="guide-dashboard-note-list">
          {goodToKnow.map((item) => (
            <article key={item.title} className="guide-dashboard-note">
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </aside>
    </section>
  );
}
