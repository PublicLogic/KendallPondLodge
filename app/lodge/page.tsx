import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";
import { StatBand } from "@/app/_components/StatBand";

export const metadata: Metadata = {
  title: "Inside the Lodge",
  description: "Three bedrooms, two full baths, two fireplaces, an open kitchen, and a cathedral-ceiling great room.",
};

export default function LodgePage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Inside the Lodge"
        title="The inside is pretty good, too."
        intro="Three bedrooms, two full baths, and a great room that makes a rainy day feel like a pretty good plan."
        image="/images/kpl/website-top-50/01-Hero/05-kendall-pond-lodge-great-room-fireplace.jpg"
        imageAlt="The great room at the Lodge at Kendall Pond"
        imagePosition="center"
        primaryAction={{ href: "/book", label: "Book your stay" }}
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
        <SectionHeading eyebrow="Main level" title="Everyone ends up here." intro="The kitchen, dining area, and great room connect on the main level." />
        <div className="photo-grid photo-grid-two">
          <PhotoCard src="/images/kpl/website-top-50/01-Hero/05-kendall-pond-lodge-great-room-fireplace.jpg" alt="The Lodge great room" title="Great room" note="Cathedral ceiling · fireplace · group seating" wide />
          <PhotoCard src="/images/kpl/website-top-50/04-Kitchen-and-Dining/17-kendall-pond-lodge-kitchen-and-breakfast-bar.jpg" alt="The Lodge kitchen and dining area" title="Kitchen & dining" note="Open kitchen and dining area" />
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="When it’s time to call it a night" title="Pick a room. Unpack." intro="There’s a king room, queen room, and bunk room. We can confirm the pull-out sleeping setup if your group needs it." />
        <div className="photo-grid">
          <PhotoCard src="/images/kpl/king-room.jpg" alt="King bedroom" title="King room" note="King bed" />
          <PhotoCard src="/images/kpl/queen-room.jpg" alt="Queen bedroom" title="Queen room" note="Queen bed" />
          <PhotoCard src="/images/kpl/website-top-50/05-Bedrooms/26-kendall-pond-lodge-bunk-room-wide.jpg" alt="Bunk room" title="Bunk room" note="Twin over full" />
          <PhotoCard src="/images/kpl/website-top-50/03-Living-Spaces/13-kendall-pond-lodge-lower-lounge-seating.jpg" alt="Lower-level lounge at the Lodge" title="Lower-level lounge" note="An additional place to sit and relax" wide />
        </div>
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="A few more things" title="Good to know." />
        <div className="info-grid info-grid-two">
          <InfoCard title="Two full baths"><p>Two full bathrooms for your group.</p></InfoCard>
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
