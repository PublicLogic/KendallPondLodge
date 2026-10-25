import type { Metadata } from "next";
import Link from "next/link";
import { Notice, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";
import { StatBand } from "@/app/_components/StatBand";

export const metadata: Metadata = {
  title: "The Lodge",
  description: "A detailed look at the house: bedrooms, the great room, the kitchen, and what it's actually like inside.",
};

export default function LodgePage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="The house"
        title="The Lodge."
        intro="Three bedrooms, a vaulted great room, and a kitchen built for a full house — not a staged rental unit."
        image="/images/kpl/lodge-exterior.jpg"
        imageAlt="The Lodge at Kendall Pond from the waterfront lawn"
        imagePosition="center 56%"
        primaryAction={{ href: "/rates", label: "Check rates" }}
        secondaryAction={{ href: "/grounds", label: "See the grounds" }}
      />

      <StatBand
        stats={[
          { value: "3", label: "Bedrooms" },
          { value: "2", label: "Baths" },
          { value: "8", label: "Max guests" },
          { value: "~2,240", label: "Sq ft" },
        ]}
      />

      <section className="content-section">
        <SectionHeading eyebrow="Shared space" title="Great room & kitchen" />
        <div className="split-section split-section-photo-first">
          <PhotoCard
            src="/images/kpl/great-room.jpg"
            alt="Vaulted great room with seating and stone fireplace"
            title="Great room"
            note="Vaulted ceiling, fireplace, room to spread out"
            wide
          />
          <div>
            <p>
              The main room does the heavy lifting: vaulted ceiling, stone fireplace, big seating area, and enough open space that eight people are not stacked on top of each other.
            </p>
            <p>
              The kitchen and dining area are part of the same footprint, which matters if you are actually cooking for a group. This is set up for real meals and long weekends, not takeout for two.
            </p>
          </div>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="Accommodations" title="Where you'll sleep" />
        <div className="photo-grid">
          <PhotoCard src="/images/kpl/king-room.jpg" alt="King bedroom on the upper level" title="King room" note="Main suite, upper level" />
          <PhotoCard src="/images/kpl/queen-room.jpg" alt="Queen bedroom on the upper level" title="Queen room" note="Guest room, upper level" />
          <PhotoCard src="/images/kpl/bunk-room.jpg" alt="Bunk bed in the lower-level room" title="Bunk room" note="Bunk bed, lower level" />
          <PhotoCard
            src="/images/kpl/kitchen-dining.jpg"
            alt="Open kitchen and dining area for shared meals"
            title="Kitchen & dining"
            note="Open plan, shared meals"
            wide
          />
        </div>
      </section>

      <section className="content-section">
        <Notice tone="plain">
          Check exact dates and pricing on Airbnb, or request an owner-approved direct quote. <Link href="/rates">See rates and booking details.</Link>
        </Notice>
      </section>
    </main>
  );
}
