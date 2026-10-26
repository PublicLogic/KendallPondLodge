import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";

export const metadata: Metadata = {
  title: "Wedding & Event Stays",
  description: "Three-bedroom waterfront lodging for wedding guests near the Polish American Citizens Club in Gardner, Massachusetts.",
};

export default function EventsPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Wedding weekends"
        title="A place for the wedding weekend."
        intro="Coming to an event at the Polish American Citizens Club? The Lodge is a short walk away and sleeps up to eight."
        image="/images/kpl/website-top-50/04-Kitchen-and-Dining/19-kendall-pond-lodge-dining-room-and-kitchen.jpg"
        imageAlt="The Lodge kitchen and dining area"
        imagePosition="center"
        primaryAction={{ href: "/book", label: "Ask about your dates" }}
        secondaryAction={{ href: "/lodge", label: "See inside" }}
      />

      <section className="content-section">
        <div className="info-grid info-grid-three">
          <InfoCard title="Walkable"><p>The Polish American Citizens Club is a short walk from the Lodge.</p></InfoCard>
          <InfoCard title="Together"><p>Three bedrooms, two bathrooms, a shared kitchen, and space to visit together.</p></InfoCard>
          <InfoCard title="Next morning"><p>Have breakfast at the house or take your coffee out to the deck.</p></InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <div className="photo-grid">
          <PhotoCard src="/images/kpl/website-top-50/01-Hero/05-kendall-pond-lodge-great-room-fireplace.jpg" alt="The Lodge great room" title="Great room" note="Fireplace and seating" wide />
          <PhotoCard src="/images/kpl/website-top-50/04-Kitchen-and-Dining/19-kendall-pond-lodge-dining-room-and-kitchen.jpg" alt="Kitchen and dining" title="Kitchen & dining" note="Space for meals together" />
          <PhotoCard src="/images/kpl/website-top-50/01-Hero/03-kendall-pond-lodge-lakeview-deck.jpg" alt="Deck overlooking the pond" title="Deck" note="Outdoor seating over the pond" />
        </div>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel">
          <div><p className="eyebrow">Coming for an event?</p><h2>Ask about your dates.</h2></div>
          <Link className="button button-primary" href="/book">Check dates →</Link>
        </div>
      </section>
    </main>
  );
}
