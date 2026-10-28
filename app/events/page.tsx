import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";
import { SleepPlan } from "@/app/_components/StayInformation";

export const metadata: Metadata = {
  title: { absolute: "Wedding Guest Stays in Gardner, MA | The Lodge at Kendall Pond" },
  description: "Stay together for a Gardner wedding in a three-bedroom waterfront house for up to eight guests, with two bathrooms, a kitchen, and information for PACC guests.",
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Wedding weekends"
        title="Stay together for the wedding weekend."
        intro="Coming to a wedding in Gardner? Share a waterfront house with three bedrooms, two full bathrooms, and room for up to eight overnight guests."
        image="/images/kpl/2026-10-28/kendall-pond-lodge-exterior-autumn.webp"
        imageAlt="The Lodge and upper deck framed by autumn trees"
        imagePosition="center"
        primaryAction={{ href: "/book", label: "Check dates" }}
        secondaryAction={{ href: "/lodge", label: "See inside" }}
      />

      <section className="content-section">
        <div className="info-grid info-grid-three">
          <InfoCard title="Going to an event at the PACC?">
            <p>The <a href="https://www.gardnerpacc.com/hall-rentals">Polish American Citizens Club in Gardner</a> hosts functions on Kendall Pond. Use the venue’s own information for event arrangements and your invitation for the schedule.</p>
            <p>The Lodge provides overnight accommodation. A stay here does not include event space, venue services, or a PACC booking.</p>
          </InfoCard>
          <InfoCard title="Plan around the wedding">
            <p>Standard check-in is 3 p.m. and checkout is 11 a.m. If the wedding schedule calls for more time, consider requesting the night before.</p>
            <p>Early check-in needs advance agreement and depends on the calendar. Include any timing needs when you send your dates.</p>
          </InfoCard>
          <InfoCard title="Breakfast the next morning" href="/explore" linkLabel="See local coffee and dining">
            <p>Have breakfast in the kitchen or take your coffee out to the deck. The great room gives your group a shared place to sit between plans.</p>
            <p>For breakfast out, Cafe Edesia is one of the Gardner options in our local guide.</p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="Choose the setup for your group" title="Three bedrooms. Eight guests maximum." intro="Look over the beds before you decide who is staying. There are two full bathrooms, and the sleeper sofa is in additional sleeping space." />
        <SleepPlan />
      </section>

      <section className="content-section">
        <div className="photo-grid">
          <PhotoCard src="/images/kpl/website-top-50/01-Hero/05-kendall-pond-lodge-great-room-fireplace.jpg" alt="The Lodge great room" title="Great room" note="Fireplace and seating" wide />
          <PhotoCard src="/images/kpl/website-top-50/04-Kitchen-and-Dining/19-kendall-pond-lodge-dining-room-and-kitchen.jpg" alt="Kitchen and dining area at the Lodge" title="Kitchen & dining" note="Breakfast together · full kitchen" />
          <PhotoCard src="/images/kpl/2026-10-28/kendall-pond-lodge-deck-lounge-autumn.webp" alt="Cushioned deck seating overlooking autumn trees and Kendall Pond" title="Upper deck" note="Outdoor seating · pond view" />
        </div>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel">
          <div><p className="eyebrow">Coming for a wedding?</p><h2>Ask about your dates.</h2><p>Send the nights and number of overnight guests. We’ll check availability and send the full price and terms before you pay. Your request alone does not reserve the house.</p></div>
          <Link className="button button-primary" href="/book">Check dates →</Link>
        </div>
      </section>
    </main>
  );
}
