import type { Metadata } from "next";
import Link from "next/link";
import { lodgePhoto } from "@/app/_data/lodge-photos";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PondScenery } from "@/app/_components/PondScenery";
import { PhotoCard } from "@/app/_components/PhotoCard";

export const metadata: Metadata = {
  title: "Waterfront",
  description: "Private shoreline, dock, kayaks, paddle boat, hot tub, firepit, deck, and lawn.",
};

export default function GroundsPage() {
  const firepit = lodgePhoto(6);
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Outside"
        title="Down by the water."
        intro="Private shoreline, a dock, lawn and firepit, plus a covered patio with a hot tub."
        image="/images/kpl/2026-10-28/kendall-pond-lodge-dawn-mist.webp"
        imageAlt="Morning mist over still water at Kendall Pond"
        imagePosition="center 55%"
        primaryAction={{ href: "/book", label: "Check dates" }}
        secondaryAction={{ href: "/lodge", label: "See inside" }}
      />

      <PondScenery
        scene="waterfront"
        eyebrow="The wider view"
        title="One shoreline. A whole pond."
        description="The Lodge has its own dock and shoreline. Beyond that, Kendall Pond opens into wooded edges and quiet corners."
        actionHref="/book"
        actionLabel="Check your dates"
        compact
      />

      <section className="content-section">
        <SectionHeading eyebrow="Shoreline" title="Down by the dock." />
        <div className="photo-grid photo-grid-two">
          <PhotoCard src="/images/kpl/website-top-50/09-Waterfront-and-Grounds/50-kendall-pond-lodge-firepit-and-dock-from-deck.jpg" alt="Elevated view of the firepit, shoreline and dock" title="From the lawn to the water" note="Firepit · shoreline · dock" wide />
          <PhotoCard src="/images/kpl/website-top-50/09-Waterfront-and-Grounds/43-kendall-pond-lodge-private-dock.jpg" alt="The private dock" title="On the water" note="Seasonal kayaks · paddle boat" />
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="Outside the house" title="Deck, patio, and firepit." />
        <div className="photo-grid photo-grid-two">
          <PhotoCard src="/images/kpl/website-top-50/01-Hero/04-kendall-pond-lodge-hot-tub-with-pond-view.jpg" alt="Hot tub overlooking Kendall Pond" title="Hot tub" note="Covered patio · pond view" wide />
          <PhotoCard src={firepit.src} alt={firepit.alt} title="Firepit" note="A few steps from the water" />
        </div>
        <div className="info-grid info-grid-three">
          <InfoCard title="Deck"><p>Outdoor dining and seating with a view of the pond.</p></InfoCard>
          <InfoCard title="Lawn"><p>The lawn runs between the house and the shore.</p></InfoCard>
          <InfoCard title="Seasonal gear"><p>Kayaks and the paddle boat may be seasonal. Ask us what will be available for your stay.</p></InfoCard>
        </div>
      </section>

      <section className="content-section">
        <Notice tone="plain">Already booked? Open the <Link href="/guidebook">Guest Guide</Link>.</Notice>
      </section>
    </main>
  );
}
