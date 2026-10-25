import type { Metadata } from "next";
import Link from "next/link";
import { BookingCtaBand } from "@/app/_components/BookingCtaBand";
import { InfoCard } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";

export const metadata: Metadata = {
  title: "Explore",
  description: "Gardner, Wachusett, nearby events, and getting to the Lodge at Kendall Pond.",
};

export default function ExplorePage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Around Kendall Pond"
        title="A little farther out."
        intro="Gardner. Wachusett. Weddings. Food. Easy day plans."
        image="/images/kpl/fall-pond.webp"
        imageAlt="Kendall Pond in fall"
        imagePosition="center 58%"
        primaryAction={{ href: "/area", label: "Gardner & Wachusett" }}
        secondaryAction={{ href: "/events", label: "Wedding weekend?" }}
      />

      <section className="content-section">
        <div className="info-grid info-grid-three">
          <InfoCard title="Wachusett"><p>Ski. Hike. Catch an event. Be back at the pond by dinner.</p></InfoCard>
          <InfoCard title="Gardner"><p>Coffee, groceries, restaurants, and local stops are close.</p></InfoCard>
          <InfoCard title="Weddings"><p>The Polish American Citizens Club is a short walk from the Lodge.</p></InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <div className="explore-arrival-strip">
          <div>
            <p className="eyebrow">Getting here</p>
            <h2>Easy.</h2>
            <p>
              Gardner is right off Route 2. Coming from Boston by commuter rail?
              Wachusett Station is the useful stop. Plan the last ride to the Lodge separately.
            </p>
          </div>
          <div className="explore-arrival-links">
            <Link href="/area">Gardner & Wachusett →</Link>
            <Link href="/events">Wedding stays →</Link>
            <Link href="/book">Book your stay →</Link>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="photo-grid">
          <PhotoCard src="/images/kpl/fall-lodge.webp" alt="The Lodge in fall" title="Fall" note="Cool air · bright leaves · hot tub" wide />
          <PhotoCard src="/images/kpl/fall-lawn.webp" alt="The waterfront lawn in fall" title="Outside" note="Lawn · pond · room to slow down" />
          <PhotoCard src="/images/kpl/fall-firepit.webp" alt="The shoreline firepit in fall" title="Later" note="Firepit · cooler nights" />
        </div>
      </section>

      <BookingCtaBand />
    </main>
  );
}
