import type { Metadata } from "next";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";

export const metadata: Metadata = { title: "House", description: "House essentials, comfort, kitchen, and entertainment guidance." };

export default function HousePage() {
  return (
    <div className="guide-section-page">
      <header className="guide-section-header">
        <p className="guide-dashboard-eyebrow">House essentials</p>
        <h2>A few house basics.</h2>
        <p>Use your reservation message for private credentials and stay-specific details. This page keeps the everyday house habits, comfort tips, and safety basics in one place.</p>
      </header>

      <section className="guide-section-stack">
        <SectionHeading eyebrow="Everyday controls" title="The basics." intro="Private credentials remain in your booking message. These are the house-wide habits that help everything work smoothly." />
        <div className="info-grid info-grid-two">
          <InfoCard title="Wi-Fi & television"><p>Use the current network and television instructions provided privately with your stay. Sign out of personal streaming accounts before checkout.</p></InfoCard>
          <InfoCard title="Heating & cooling"><p>Keep doors and windows closed while heating or cooling is running. If the house will not reach a comfortable temperature, message the hosts rather than forcing a control.</p></InfoCard>
          <InfoCard title="Kitchen & water"><p>Use appliances as intended. Stop if something feels loose, blocked, damaged, unusually hot, or smells wrong. Report leaks immediately.</p></InfoCard>
          <InfoCard id="children-pets" title="Children & pets"><p>The pond, dock, pool, hot tub, fire pit, stairs, and road require active adult supervision. Follow the pet terms included with the reservation.</p></InfoCard>
        </div>
        <Notice><strong>Something is not responding?</strong> Do not force a valve, cap, control, breaker, door, appliance, or entertainment device. Message the hosts with a short description and photo when useful.</Notice>
      </section>

      <section className="guide-section-stack guide-section-surface">
        <SectionHeading eyebrow="Inside the lodge" title="Which room is which." intro="Room and bed photos live on the homepage gallery. Here's a quick reference for what's booked." />
        <div className="info-grid info-grid-two">
          <InfoCard title="King room"><p>Primary guest bedroom with a king bed.</p></InfoCard>
          <InfoCard title="Queen room"><p>Second guest bedroom with a queen bed.</p></InfoCard>
          <InfoCard title="Bunk room"><p>One twin-over-full bunk bed.</p></InfoCard>
          <InfoCard title="Kitchen & dining"><p>A full kitchen with a breakfast bar and dining table.</p></InfoCard>
        </div>
      </section>
    </div>
  );
}
