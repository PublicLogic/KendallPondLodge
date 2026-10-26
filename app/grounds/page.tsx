import type { Metadata } from "next";
import Link from "next/link";
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
        title="Yep. That’s all out back."
        intro="The lawn, the dock, the firepit and the hot tub are all steps from the house. No day trip required."
        image="/images/kpl/website-top-50/01-Hero/02-kendall-pond-lodge-autumn-waterfront.jpg"
        imageAlt="Kendall Pond from the Lodge"
        imagePosition="center 55%"
        primaryAction={{ href: "/book", label: "Check dates" }}
        secondaryAction={{ href: "/lodge", label: "See inside" }}
      />

      <section className="content-section">
        <SectionHeading eyebrow="Shoreline" title="Follow the lawn." />
        <div className="photo-grid photo-grid-two">
          <PhotoCard src="/images/kpl/website-top-50/01-Hero/02-kendall-pond-lodge-autumn-waterfront.jpg" alt="Kendall Pond" title="Kendall Pond" note="Private shoreline · dock" wide position="center 55%" />
          <PhotoCard src="/images/kpl/website-top-50/09-Waterfront-and-Grounds/43-kendall-pond-lodge-private-dock.jpg" alt="The private dock" title="On the water" note="Seasonal kayaks · paddle boat" />
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="When the sun starts to drop" title="Stay out a little longer." />
        <div className="photo-grid photo-grid-two">
          <PhotoCard src="/images/kpl/website-top-50/01-Hero/04-kendall-pond-lodge-hot-tub-with-pond-view.jpg" alt="Hot tub overlooking Kendall Pond" title="Hot tub" note="Covered patio · pond view" wide />
          <PhotoCard src="/images/kpl/website-top-50/09-Waterfront-and-Grounds/40-kendall-pond-lodge-summer-firepit-and-shoreline.jpg" alt="Firepit by Kendall Pond" title="Firepit" note="A few steps from the water" />
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
