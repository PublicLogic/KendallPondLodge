import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";

export const metadata: Metadata = {
  title: "Events",
  description: "A relaxed home base for nearby celebrations — three minutes on foot from PACC.",
};

export default function EventsPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Nearby celebrations"
        title="Events & PACC."
        intro="The Polish American Citizens Club is about a three-minute walk from the lodge — an easy, relaxed home base for a wedding block or group weekend."
        image="/images/kpl/kitchen-dining.jpg"
        imageAlt="The lodge kitchen and dining area set up for a shared meal"
        imagePosition="center"
        primaryAction={{ href: "/rates", label: "Check rates" }}
        secondaryAction={{ href: "/lodge", label: "See the house" }}
      />

      <section className="content-section">
        <SectionHeading
          eyebrow="An easy walk"
          title="Stay close, then get quiet."
        />
        <div className="info-grid info-grid-three">
          <InfoCard title="An easy walk">
            <p>PACC is about three minutes from the lodge on foot. No shuttle math, no long drive back at the end of the night.</p>
          </InfoCard>
          <InfoCard title="A relaxed home base">
            <p>Stay close to the celebration, then come back to the pond for a quieter evening. That is the whole advantage.</p>
          </InfoCard>
          <InfoCard title="Planning a group stay?">
            <p>Message the hosts through your booking platform with your dates and guest count. You will get a quick, direct answer.</p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading
          eyebrow="The house"
          title="Room enough for the group"
        />
        <div className="photo-grid">
          <PhotoCard
            src="/images/kpl/great-room.jpg"
            alt="The lodge great room with vaulted ceilings and seating"
            title="Great room"
            note="Vaulted ceilings, room to gather"
            wide
          />
          <PhotoCard
            src="/images/kpl/kitchen-dining.jpg"
            alt="The lodge kitchen and dining area"
            title="Kitchen & dining"
            note="Built for feeding a crowd"
          />
          <PhotoCard
            src="/images/kpl/firepit.jpg"
            alt="The lodge firepit beside Kendall Pond"
            title="Firepit"
            note="Evenings by the water"
          />
        </div>
      </section>

      <section className="content-section">
        <Notice tone="plain">
          Exact dates and booking still happen on <Link href="/rates">Airbnb/direct inquiry</Link>.
        </Notice>
      </section>
    </main>
  );
}
