import type { Metadata } from "next";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";

export const metadata: Metadata = { title: "Arrival", description: "Arrival, entry, and orientation guidance for a Kendall Pond stay." };

export default function ArrivalPage() {
  return (
    <div className="guide-section-page">
      <header className="guide-section-header">
        <p className="guide-dashboard-eyebrow">Arrival & entry</p>
        <h2>Welcome to the Lodge.</h2>
        <p>Your latest message from us has the directions, arrival time, and entry details. Keep it handy when you arrive.</p>
      </header>

      <section className="guide-section-stack">
        <SectionHeading eyebrow="First few minutes" title="Get settled." />
        <div className="step-grid">
          <InfoCard title="1. Open the latest message"><p>Use the most recent host message for directions and entry. It replaces old screenshots, forwarded details, and earlier instructions.</p></InfoCard>
          <InfoCard title="2. Get oriented"><p>Locate exits, extinguishers, life jackets, the first-aid kit, and this stay panel before settling in.</p></InfoCard>
          <InfoCard title="3. Tell us about a problem"><p>If something is missing, damaged, unsafe, or not working, message the hosts in the booking app so it can be handled.</p></InfoCard>
        </div>
        <Notice tone="warm"><strong>For your privacy:</strong> Your address, access code, and Wi-Fi password are shared privately in your reservation message.</Notice>
      </section>

      <section className="guide-section-stack guide-section-surface">
        <SectionHeading eyebrow="Before unloading" title="A fast safety check." intro="Conditions change. Take a moment to identify the edges of the property and anything children or pets could reach." />
        <div className="check-list">
          <div><span>01</span><p><strong>Waterfront</strong>Find the pond, dock, life jackets, and safest route between the house and shoreline.</p></div>
          <div><span>02</span><p><strong>Outdoor areas</strong>Note the hot tub, fire pit, pool availability, stairs, road, and any wet or icy surfaces.</p></div>
          <div><span>03</span><p><strong>Inside the house</strong>Locate exits, first aid, extinguishers, and the main gathering spaces.</p></div>
          <div><span>04</span><p><strong>Emergency plan</strong>Call 911 for immediate danger. Use the booking thread for non-emergency property help.</p></div>
        </div>
      </section>
    </div>
  );
}
