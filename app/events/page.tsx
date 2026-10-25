import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";

export const metadata: Metadata = {
  title: "Wedding & Event Stays",
  description:
    "Stay at the Lodge at Kendall Pond for nearby weddings and gatherings, including events at the Polish American Citizens Club.",
};

export default function EventsPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Wedding weekends & gatherings"
        title="Stay together. Walk back to the pond."
        intro="The Polish American Citizens Club is a short walk from the Lodge, making the house an easy home base before and after the celebration."
        image="/images/kpl/kitchen-dining.jpg"
        imageAlt="The open kitchen and dining area at the Lodge"
        imagePosition="center"
        primaryAction={{ href: "/book", label: "Ask about your dates" }}
        secondaryAction={{ href: "/lodge", label: "See the house" }}
      />

      <section className="content-section">
        <SectionHeading
          eyebrow="Why it works"
          title="Close to the event. Better after the event."
        />
        <div className="info-grid info-grid-three">
          <InfoCard title="A short walk">
            <p>No long drive back after the reception and less shuttle math for a group staying together.</p>
          </InfoCard>
          <InfoCard title="Room for the weekend">
            <p>The kitchen, great room, deck, and shoreline give everyone places to gather before the event and decompress afterward.</p>
          </InfoCard>
          <InfoCard title="The morning after">
            <p>Coffee by the pond and a slower checkout morning beats gathering everyone in a hotel lobby.</p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="The house" title="A home base for the group." />
        <div className="photo-grid">
          <PhotoCard
            src="/images/kpl/great-room.jpg"
            alt="The Lodge great room"
            title="Great room"
            note="Room to gather"
            wide
          />
          <PhotoCard
            src="/images/kpl/kitchen-dining.jpg"
            alt="The Lodge kitchen and dining area"
            title="Kitchen & dining"
            note="Breakfast, snacks, and the next-day recap"
          />
          <PhotoCard
            src="/images/kpl/pond-seating.jpg"
            alt="The Lodge deck overlooking Kendall Pond"
            title="Deck by the pond"
            note="A quieter place between plans"
          />
        </div>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">Coming for an event?</p>
            <h2>Send us the dates and guest count.</h2>
            <p>We will tell you quickly whether the Lodge fits the weekend and prepare a complete quote before you pay anything.</p>
          </div>
          <div>
            <Link className="button button-primary" href="/book">Ask about your stay →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
