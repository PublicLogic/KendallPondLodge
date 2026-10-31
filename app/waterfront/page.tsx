import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";

export const metadata: Metadata = { title: "Waterfront", description: "Pond, boat, dock, and waterfront safety guidance." };

export default function WaterfrontPage() {
  return (
    <div className="guide-section-page">
      <header className="guide-section-header">
        <p className="guide-dashboard-eyebrow">Pond & boats</p>
        <h2>Check the water before you go.</h2>
        <p>Use the provided safety equipment, stay within your ability, and keep children directly supervised near the shoreline, dock, and boats.</p>
      </header>

      <section className="guide-section-stack">
        <SectionHeading eyebrow="Before entering the water" title="Four things every time." />
        <div className="info-grid info-grid-two">
          <InfoCard title="Wear a life jacket"><p>Wear a properly fitted life jacket whenever using a kayak or paddle boat. Children need direct adult supervision near the water.</p></InfoCard>
          <InfoCard title="Check the conditions"><p>Stay ashore during storms, high wind, poor visibility, cold-water risk, or any condition that feels beyond your ability.</p></InfoCard>
          <InfoCard title="Stay together"><p>Do not swim or boat alone. Keep alcohol away from boating and active supervision.</p></InfoCard>
          <InfoCard title="Return the gear"><p>Bring boats, paddles, and life jackets back to their designated places and secure them after use.</p></InfoCard>
        </div>
        <Notice tone="safety"><strong>Immediate danger:</strong> Call 911 for a water emergency. Do not rely on this website or the booking inbox for emergency response.</Notice>
      </section>

      <section className="guide-section-stack guide-section-surface">
        <SectionHeading eyebrow="At the shoreline" title="Back at the dock." />
        <p>Want another look at the dock and the shoreline? See the <Link href="/grounds">waterfront photos</Link> before heading outside.</p>
      </section>
    </div>
  );
}
