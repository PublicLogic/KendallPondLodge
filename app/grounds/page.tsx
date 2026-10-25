import type { Metadata } from "next";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";

export const metadata: Metadata = {
  title: "The Grounds",
  description: "Private beach, dock, firepit, hot tub, and the deck — the outdoor side of the lodge.",
};

export default function GroundsPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Outside"
        title="The Grounds."
        intro="Private beach and dock, a firepit at the shoreline, a covered hot tub, and a deck built for lingering."
        image="/images/kpl/pond.jpg"
        imageAlt="Kendall Pond and the shoreline at the Lodge at Kendall Pond"
        imagePosition="center 55%"
        primaryAction={{ href: "/lodge", label: "See the house" }}
        secondaryAction={{ href: "/rates", label: "Check rates" }}
      />

      <section className="content-section">
        <SectionHeading
          eyebrow="Waterfront"
          title="Private beach & dock"
          intro="The shoreline is part of the stay, not a public launch down the road. Beach access, dock access, and a place to sit are all right here."
        />
        <div className="photo-grid photo-grid-two">
          <PhotoCard
            src="/images/kpl/pond.jpg"
            alt="Kendall Pond at the lodge shoreline"
            title="Kendall Pond"
            note="Private shoreline access"
            wide
            position="center 55%"
          />
          <PhotoCard
            src="/images/kpl/waterfront-dock.jpg"
            alt="Private dock, paddleboat, and lounge chair at the Kendall Pond shoreline"
            title="Dock & shoreline"
            note="Private dock and paddleboat launch"
          />
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading
          eyebrow="After dark"
          title="Firepit & hot tub"
          intro="The best parts of the property keep working after sunset: shoreline fire, covered soak, and a deck that actually gets used."
        />
        <div className="split-section split-section-photo-first">
          <PhotoCard
            src="/images/kpl/firepit.jpg"
            alt="Stone firepit near the Kendall Pond shoreline"
            title="Shoreline firepit"
            note="Stone firepit set near the water"
            wide
            position="center"
          />
          <div className="info-grid info-grid-two">
            <InfoCard title="Firepit">
              <p>The stone firepit sits at the shoreline, close enough to the water to feel separate from the house without being remote.</p>
            </InfoCard>
            <InfoCard title="Hot tub">
              <p>The hot tub is covered and set on the lower patio, giving it some shelter while keeping the pond in view.</p>
            </InfoCard>
            <InfoCard title="Deck">
              <p>The wraparound deck handles the in-between hours: coffee in the morning, dinner outside, and a place to land while keeping an eye on the water.</p>
            </InfoCard>
          </div>
        </div>
      </section>

      <section className="content-section">
        <Notice tone="plain">
          <strong>Guest details:</strong> Full safety guidance for the waterfront, hot tub, and firepit lives in the private Guidebook after booking.
        </Notice>
      </section>
    </main>
  );
}
