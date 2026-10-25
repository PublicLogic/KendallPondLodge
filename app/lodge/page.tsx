import type { Metadata } from "next";
import Link from "next/link";
import { BookingCtaBand } from "@/app/_components/BookingCtaBand";
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
        image="/images/kpl/kitchen-dining.jpg"
        imageAlt="The Lodge kitchen and dining area"
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
          <PhotoCard
            src="/images/kpl/great-room.jpg"
            alt="The Lodge great room"
            title="Great room"
            note="Cathedral ceiling · fireplace · big seating area"
            wide
            position="72% 38%"
            zoom={1.28}
          />
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="Sleeping" title="Three bedrooms. Flexible space." intro="Tell us your group size and we’ll make sure the setup fits." />
        <div className="photo-grid">
          <PhotoCard src="/images/kpl/king-room.jpg" alt="King bedroom" title="King room" note="King bed" />
          <PhotoCard src="/images/kpl/queen-room.jpg" alt="Queen bedroom" title="Queen room" note="Queen bed" />
          <PhotoCard src="/images/kpl/bunk-room.jpg" alt="Bunk room" title="Bunk room" note="Twin over full" />
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
        <div className="photo-grid lodge-setup-photo-grid">
          <PhotoCard
            src="/images/kpl/lodge-exterior.jpg"
            alt="The Lodge deck and walkout patio from the waterfront lawn"
            title="Deck + walkout patio"
            note="Deck above · patio + hot tub below"
            wide
            position="center 46%"
          />
          <PhotoCard
            src="/images/kpl/hot-tub.jpg"
            alt="The covered hot tub looking out toward Kendall Pond"
            title="Hot tub"
            note="Covered patio · pond view"
            position="center"
          />
        </div>
      </section>

      <section className="content-section">
        <Notice tone="plain">Already booked? Open the <Link href="/guidebook">Guest Guide</Link>.</Notice>
      </section>

      <BookingCtaBand />
    </main>
  );
}
