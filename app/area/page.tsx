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
        eyebrow="Beyond the pond"
        title="Gardner + Wachusett."
        intro="Close enough to add to the weekend. Not the reason you came."
        image="/images/kpl/pond.jpg"
        imageAlt="Kendall Pond from the Lodge"
        imagePosition="center 55%"
        primaryAction={{ href: "/book", label: "Book your stay" }}
        secondaryAction={{ href: "/explore", label: "Explore" }}
      />

      <section className="content-section">
        <div className="info-grid info-grid-three">
          <InfoCard title="Wachusett"><p>Skiing, hiking, and seasonal events.</p></InfoCard>
          <InfoCard title="Gardner"><p>Coffee, food, groceries, and the practical stuff.</p></InfoCard>
          <InfoCard title="Train"><p>Wachusett Station is the useful Fitchburg Line stop from Boston.</p></InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="Season by season" title="Same pond. Different weekend." />
        <div className="info-grid info-grid-two">
          <InfoCard title="Summer"><p>Water. Boats. Deck dinners. Late sunsets.</p></InfoCard>
          <InfoCard title="Fall"><p>Foliage. Firepit. Hot-tub weather.</p></InfoCard>
          <InfoCard title="Winter"><p>Wachusett by day. Fireplaces at night.</p></InfoCard>
          <InfoCard title="Spring"><p>Quiet water. Open weekends. Less rush.</p></InfoCard>
        </div>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel">
          <div><p className="eyebrow">Have dates?</p><h2>Come up.</h2></div>
          <Link className="button button-primary" href="/book">Book your stay →</Link>
        </div>
      </section>
    </main>
  );
}
