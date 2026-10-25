import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";

export const metadata: Metadata = {
  title: "Waterfront",
  description:
    "The outdoor side of the Lodge at Kendall Pond: private shoreline, dock, kayaks, paddle boat, hot tub, firepit, deck, and lawn.",
};

export default function GroundsPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Outside the Lodge"
        title="Down by the water."
        intro="Step out from the house to the patio, hot tub, lawn, firepit, private shoreline, dock, kayaks, and paddle boat."
        image="/images/kpl/pond.jpg"
        imageAlt="Kendall Pond from the Lodge shoreline"
        imagePosition="center 55%"
        primaryAction={{ href: "/book", label: "Book your stay" }}
        secondaryAction={{ href: "/lodge", label: "See inside" }}
      />

      <section className="content-section">
        <SectionHeading
          eyebrow="The shoreline"
          title="The pond is part of the stay."
          intro="You do not drive somewhere else to get to the water. The beach, dock, boats, and places to sit are right outside."
        />

        <div className="photo-grid photo-grid-two">
          <PhotoCard
            src="/images/kpl/pond.jpg"
            alt="Kendall Pond at the Lodge"
            title="Kendall Pond"
            note="Private shoreline, beach, and dock"
            wide
            position="center 55%"
          />
          <PhotoCard
            src="/images/kpl/waterfront-dock.jpg"
            alt="The private dock at Kendall Pond"
            title="Dock & boats"
            note="Kayaks and paddle boat in season"
          />
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading
          eyebrow="When the sun goes down"
          title="Stay outside a little longer."
          intro="The hot tub is tucked under the deck, the firepit is closer to the shoreline, and the pond stays in view from both."
        />

        <div className="photo-grid photo-grid-two">
          <PhotoCard
            src="/images/kpl/hot-tub.jpg"
            alt="Covered hot tub overlooking Kendall Pond"
            title="Hot tub"
            note="Covered patio with a pond view"
            wide
          />
          <PhotoCard
            src="/images/kpl/firepit.jpg"
            alt="Firepit near the Kendall Pond shoreline"
            title="Firepit"
            note="A few steps from the water"
          />
        </div>

        <div className="info-grid info-grid-three">
          <InfoCard title="The deck">
            <p>Morning coffee, dinner outside, or somewhere to sit while the rest of the group is down by the water.</p>
          </InfoCard>
          <InfoCard title="The lawn">
            <p>Enough room to spread out between the house and shoreline without losing sight of the pond.</p>
          </InfoCard>
          <InfoCard title="Seasonal equipment">
            <p>Boats and other outdoor amenities can be seasonal. If something is important to your trip, ask us before booking.</p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section">
        <Notice tone="plain">
          Already booked? Waterfront, hot-tub, firepit, and safety details are in the private <Link href="/guidebook">Guest Guide</Link>.
        </Notice>
      </section>
    </main>
  );
}
