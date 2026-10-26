import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";

export const metadata: Metadata = {
  title: "Gardner & Wachusett",
  description: "Gardner, Wachusett Mountain, seasonal trips, and train access near Kendall Pond.",
};

export default function AreaPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Gardner & Wachusett"
        title="A little farther from the pond."
        intro="Gardner has local shops and restaurants, and Wachusett offers skiing, hiking, and seasonal events."
        image="/images/kpl/website-top-50/09-Waterfront-and-Grounds/46-kendall-pond-lodge-autumn-pond-and-dock.jpg"
        imageAlt="Kendall Pond from the Lodge"
        imagePosition="center 55%"
        primaryAction={{ href: "/book", label: "Book your stay" }}
        secondaryAction={{ href: "/explore", label: "Explore" }}
      />

      <section className="content-section">
        <div className="info-grid info-grid-three">
          <InfoCard title="Wachusett"><p>Skiing, hiking, and seasonal events.</p></InfoCard>
          <InfoCard title="Gardner"><p>Local restaurants, grocery stores, and coffee shops.</p></InfoCard>
          <InfoCard title="Train"><p>Wachusett Station is on the Fitchburg Line from Boston. Arrange transportation from the station to the Lodge.</p></InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="Season by season" title="What the seasons bring." />
        <div className="info-grid info-grid-two">
          <InfoCard title="Summer"><p>Spend time at the dock, on the lawn, and on the deck.</p></InfoCard>
          <InfoCard title="Fall"><p>The trees change color around the pond and the firepit comes into its own.</p></InfoCard>
          <InfoCard title="Winter"><p>Ski at Wachusett when conditions allow, then settle in by the fireplace.</p></InfoCard>
          <InfoCard title="Spring"><p>The shoreline and grounds change with the season.</p></InfoCard>
        </div>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel">
          <div><p className="eyebrow">Have dates?</p><h2>Thinking about a stay?</h2></div>
          <Link className="button button-primary" href="/book">Check dates →</Link>
        </div>
      </section>
    </main>
  );
}
