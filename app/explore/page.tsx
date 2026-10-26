import type { Metadata } from "next";
import Link from "next/link";
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
        eyebrow="Around Gardner"
        title="Gardner and Wachusett."
        intro="Find local restaurants, spend a day at Wachusett, or stay nearby for a wedding."
        image="/images/kpl/website-top-50/09-Waterfront-and-Grounds/46-kendall-pond-lodge-autumn-pond-and-dock.jpg"
        imageAlt="Kendall Pond in fall"
        imagePosition="center 58%"
        primaryAction={{ href: "/area", label: "Gardner & Wachusett" }}
        secondaryAction={{ href: "/events", label: "Wedding weekend?" }}
      />

      <section className="content-section">
        <div className="info-grid info-grid-three">
          <InfoCard title="Wachusett"><p>Hiking, skiing, and seasonal events are good reasons to head out for the day.</p></InfoCard>
          <InfoCard title="Gardner"><p>Restaurants, coffee, groceries, and everyday stops are in town.</p></InfoCard>
          <InfoCard title="Weddings"><p>The Polish American Citizens Club is a short walk from the Lodge.</p></InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <div className="explore-arrival-strip">
          <div>
            <p className="eyebrow">Getting here</p>
            <h2>Getting to the Lodge.</h2>
            <p>
              Gardner is off Route 2. If you’re coming by commuter rail from Boston,
              Wachusett Station is on the Fitchburg Line. You’ll need to arrange
              a ride from the station to the Lodge.
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
          <PhotoCard src="/images/kpl/website-top-50/02-Exterior/07-kendall-pond-lodge-autumn-lodge-and-yard.jpg" alt="The Lodge in fall" title="The Lodge in fall" note="Autumn foliage around the house" wide />
          <PhotoCard src="/images/kpl/website-top-50/09-Waterfront-and-Grounds/48-kendall-pond-lodge-autumn-lawn.jpg" alt="The waterfront lawn in fall" title="The waterfront lawn" note="Lawn between the house and shoreline" />
          <PhotoCard src="/images/kpl/website-top-50/09-Waterfront-and-Grounds/47-kendall-pond-lodge-late-autumn-firepit.jpg" alt="The shoreline firepit in fall" title="Firepit by the water" note="Shoreline seating in autumn" />
        </div>
      </section>
    </main>
  );
}
