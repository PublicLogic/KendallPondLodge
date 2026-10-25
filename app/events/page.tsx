import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";

export const metadata: Metadata = {
  title: "Wedding & Event Stays",
  description: "A lakefront home base for weddings and gatherings near Kendall Pond.",
};

export default function EventsPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Wedding weekends"
        title="Stay together."
        intro="The Polish American Citizens Club is a short walk away. The pond is waiting when you get back."
        image="/images/kpl/kitchen-dining.jpg"
        imageAlt="The Lodge kitchen and dining area"
        imagePosition="center"
        primaryAction={{ href: "/book", label: "Ask about your dates" }}
        secondaryAction={{ href: "/lodge", label: "See inside" }}
      />

      <section className="content-section">
        <div className="info-grid info-grid-three">
          <InfoCard title="Walkable"><p>Skip the long ride back after the reception.</p></InfoCard>
          <InfoCard title="Together"><p>Kitchen, great room, deck, and shoreline for the whole weekend.</p></InfoCard>
          <InfoCard title="Next morning"><p>Coffee by the pond beats a hotel lobby.</p></InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <div className="photo-grid">
          <PhotoCard src="/images/kpl/great-room.jpg" alt="The Lodge great room" title="Gather" note="Great room" wide />
          <PhotoCard src="/images/kpl/kitchen-dining.jpg" alt="Kitchen and dining" title="Eat" note="Open kitchen" />
          <PhotoCard src="/images/kpl/pond-seating.jpg" alt="Deck overlooking the pond" title="Exhale" note="Deck + pond" />
        </div>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel">
          <div><p className="eyebrow">Coming for an event?</p><h2>Send the dates.</h2></div>
          <Link className="button button-primary" href="/book">Ask about your stay →</Link>
        </div>
      </section>
    </main>
  );
}
