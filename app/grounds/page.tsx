import type { Metadata } from "next";
import Link from "next/link";
import { BookingCtaBand } from "@/app/_components/BookingCtaBand";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";

export const metadata: Metadata = {
  title: "Waterfront",
  description: "Private shoreline, dock, kayaks, paddle boat, hot tub, firepit, deck, and lawn.",
};

export default function GroundsPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Outside"
        title="Down by the water."
        intro="Beach. Dock. Boats. Hot tub. Firepit. All right outside."
        image="/images/kpl/pond.jpg"
        imageAlt="Kendall Pond from the Lodge"
        imagePosition="center 55%"
        primaryAction={{ href: "/book", label: "Book your stay" }}
        secondaryAction={{ href: "/lodge", label: "See inside" }}
      />

      <section className="content-section">
        <SectionHeading eyebrow="Shoreline" title="The pond is the backyard." />
        <div className="photo-grid photo-grid-two">
          <PhotoCard src="/images/kpl/pond.jpg" alt="Kendall Pond" title="Kendall Pond" note="Private beach · dock" wide position="center 55%" />
          <PhotoCard src="/images/kpl/waterfront-dock.jpg" alt="The private dock" title="On the water" note="Kayaks · paddle boat" />
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="After dark" title="Stay outside." />
        <div className="photo-grid photo-grid-two">
          <PhotoCard src="/images/kpl/hot-tub.jpg" alt="Hot tub overlooking Kendall Pond" title="Hot tub" note="Covered patio · pond view" wide />
          <PhotoCard src="/images/kpl/firepit.jpg" alt="Firepit by Kendall Pond" title="Firepit" note="A few steps from the water" />
        </div>
        <div className="info-grid info-grid-three">
          <InfoCard title="Deck"><p>Coffee. Dinner. Pond view.</p></InfoCard>
          <InfoCard title="Lawn"><p>Room to spread out.</p></InfoCard>
          <InfoCard title="Seasonal gear"><p>If a boat or amenity matters, ask before booking.</p></InfoCard>
        </div>
      </section>

      <section className="content-section">
        <Notice tone="plain">Already booked? Open the <Link href="/guidebook">Guest Guide</Link>.</Notice>
      </section>

      <BookingCtaBand />
    </main>
  );
}
