import type { Metadata } from "next";
import Link from "next/link";
import { lodgePhoto } from "@/app/_data/lodge-photos";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";
import { SleepPlan } from "@/app/_components/StayInformation";
import { StatBand } from "@/app/_components/StatBand";

export const metadata: Metadata = {
  title: "Inside the Lodge",
  alternates: { canonical: "/lodge" },
  description: "Three bedrooms, two full baths, two fireplaces, an open kitchen, and a cathedral-ceiling great room.",
};

export default function LodgePage() {
  const woodBedroom = lodgePhoto(25);
  const tiledBedroom = lodgePhoto(23);
  const bunkRoom = lodgePhoto(27);
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Inside the Lodge"
        title="Room for eight."
        intro="Three bedrooms, two full bathrooms, a kitchen and dining area, and a great room with a fireplace."
        image="/images/kpl/website-top-50/01-Hero/05-kendall-pond-lodge-great-room-fireplace.jpg"
        imageAlt="The great room at the Lodge at Kendall Pond"
        imagePosition="center"
        primaryAction={{ href: "/book", label: "Request your dates" }}
        secondaryAction={{ href: "/grounds", label: "Waterfront" }}
      />

      <StatBand
        stats={[
          { value: "8", label: "Guests" },
          { value: "3", label: "Bedrooms" },
          { value: "2", label: "Full baths" },
          { value: "2", label: "Fireplaces" },
        ]}
      />

      <section className="content-section">
        <SectionHeading eyebrow="Main level" title="The main living space." intro="The kitchen, dining area, and great room connect on the main level." />
        <div className="photo-grid photo-grid-two">
          <PhotoCard src="/images/kpl/website-top-50/01-Hero/05-kendall-pond-lodge-great-room-fireplace.jpg" alt="The Lodge great room" title="Great room" note="Cathedral ceiling · fireplace · group seating" wide />
          <PhotoCard src="/images/kpl/website-top-50/04-Kitchen-and-Dining/17-kendall-pond-lodge-kitchen-and-breakfast-bar.jpg" alt="The Lodge kitchen and dining area" title="Kitchen & dining" note="Open kitchen and dining area" />
        </div>
      </section>

      <section className="content-section surface-section" id="sleeping">
        <SectionHeading eyebrow="Sleeping" title="The bedrooms." intro="Three bedrooms, plus a queen sleeper sofa for a different sleeping arrangement." />
        <SleepPlan />
        <div className="photo-grid">
          <PhotoCard src={woodBedroom.src} alt={woodBedroom.alt} title="Wood-floor bedroom" note="White bedding · folded towels" />
          <PhotoCard src={tiledBedroom.src} alt={tiledBedroom.alt} title="Tiled bedroom" note="Blue throw · folded towels" />
          <PhotoCard src={bunkRoom.src} alt={bunkRoom.alt} title="Bunk room" note="Twin over full" />
          <PhotoCard src="/images/kpl/website-top-50/03-Living-Spaces/13-kendall-pond-lodge-lower-lounge-seating.jpg" alt="Lower-level lounge at the Lodge" title="Lower-level lounge" note="An additional place to sit and relax" wide />
        </div>
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="Around the house" title="More about the house." />
        <div className="info-grid info-grid-two">
          <InfoCard title="Two full baths"><p>Two bathrooms, both with bathing facilities. Ask us about the layout if stairs or bathroom access affect your stay.</p></InfoCard>
          <InfoCard title="Two fireplaces"><p>One fireplace upstairs and one downstairs.</p></InfoCard>
          <InfoCard title="Deck + walkout patio"><p>Outdoor dining on the upper deck and a covered patio near the hot tub.</p></InfoCard>
          <InfoCard title="Real-life basics"><p>A full kitchen, laundry, and space to settle in.</p></InfoCard>
        </div>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">Booking</p>
            <h2>Have dates in mind?</h2>
            <p>We’ll check the calendar and send a full quote before payment.</p>
          </div>
          <Link className="button button-primary" href="/book">Check dates →</Link>
        </div>
      </section>

      <section className="content-section">
        <Notice tone="plain">Already booked? Open the <Link href="/guidebook">Guest Guide</Link>.</Notice>
      </section>
    </main>
  );
}
