import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";
import { StatBand } from "@/app/_components/StatBand";

export const metadata: Metadata = {
  title: "Inside the Lodge",
  description: "Three bedrooms, two full baths, two fireplaces, an open kitchen, and a cathedral-ceiling great room.",
};

export default function LodgePage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Inside the Lodge"
        title="Room for the whole crew."
        intro="Three bedrooms. Two baths. Two fireplaces. Big kitchen. Bigger great room."
        image="/images/kpl/website-top-50/01-Hero/05-kendall-pond-lodge-great-room-fireplace.jpg"
        imageAlt="The great room at the Lodge at Kendall Pond"
        imagePosition="center"
        primaryAction={{ href: "/book", label: "Book your stay" }}
        secondaryAction={{ href: "/grounds", label: "Waterfront" }}
      />

      <StatBand
        stats={[
          { value: "8", label: "Guests" },
          { value: "3", label: "Bedrooms" },
          { value: "2", label: "Full baths" },
          { value: "2", label: "Fireplaces" },
        ]}
      />

      <section className="content-section">
        <SectionHeading eyebrow="Main level" title="Made for a full house." intro="Kitchen, dining, and the great room share one open space." />
        <div className="photo-grid photo-grid-two">
          <PhotoCard src="/images/kpl/website-top-50/01-Hero/05-kendall-pond-lodge-great-room-fireplace.jpg" alt="The Lodge great room" title="Great room" note="Cathedral ceiling · fireplace · big seating area" wide />
          <PhotoCard src="/images/kpl/website-top-50/04-Kitchen-and-Dining/17-kendall-pond-lodge-kitchen-and-breakfast-bar.jpg" alt="The Lodge kitchen and dining area" title="Kitchen & dining" note="Open plan · built for a group" />
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="Sleeping" title="Three bedrooms. Flexible space." intro="Tell us your group size and we’ll make sure the setup fits." />
        <div className="photo-grid">
          <PhotoCard src="/images/kpl/king-room.jpg" alt="King bedroom" title="King room" note="King bed" />
          <PhotoCard src="/images/kpl/queen-room.jpg" alt="Queen bedroom" title="Queen room" note="Queen bed" />
          <PhotoCard src="/images/kpl/website-top-50/05-Bedrooms/26-kendall-pond-lodge-bunk-room-wide.jpg" alt="Bunk room" title="Bunk room" note="Twin over full" />
          <PhotoCard src="/images/kpl/website-top-50/01-Hero/05-kendall-pond-lodge-great-room-fireplace.jpg" alt="Shared living space" title="Extra space" note="Queen pull-out + lounge space" wide />
        </div>
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="The setup" title="Everything you need. Nothing precious." />
        <div className="info-grid info-grid-two">
          <InfoCard title="Two full baths"><p>Enough for a full group without scheduling showers.</p></InfoCard>
          <InfoCard title="Two fireplaces"><p>One upstairs. One down.</p></InfoCard>
          <InfoCard title="Deck + walkout patio"><p>Deck above. Hot tub, lawn, firepit, and water below.</p></InfoCard>
          <InfoCard title="Real-life basics"><p>Kitchen, laundry, storage, and room to unpack.</p></InfoCard>
        </div>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">Come stay</p>
            <h2>Send us your dates.</h2>
            <p>We’ll check availability and send the full quote.</p>
          </div>
          <Link className="button button-primary" href="/book">Book your stay →</Link>
        </div>
      </section>

      <section className="content-section">
        <Notice tone="plain">Already booked? Open the <Link href="/guidebook">Guest Guide</Link>.</Notice>
      </section>
    </main>
  );
}
