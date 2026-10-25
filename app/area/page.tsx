import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";

export const metadata: Metadata = {
  title: "Gardner & Wachusett",
  description:
    "Gardner, Wachusett Mountain, seasonal events, and practical ways to get to the Lodge at Kendall Pond.",
};

export default function AreaPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Beyond the pond"
        title="Gardner & Wachusett."
        intro="You can stay put all weekend. If you want to get out, Gardner and Wachusett give you enough to do without turning the trip into a driving tour."
        image="/images/kpl/pond.jpg"
        imageAlt="Kendall Pond from the Lodge shoreline"
        imagePosition="center 55%"
        primaryAction={{ href: "/book", label: "Book your stay" }}
        secondaryAction={{ href: "/explore", label: "Explore nearby" }}
      />

      <section className="content-section">
        <SectionHeading eyebrow="Nearby" title="Easy additions to the weekend." />
        <div className="info-grid info-grid-three">
          <InfoCard title="Wachusett Mountain">
            <p>
              Skiing in winter, hiking and events in the warmer months, and a
              full day out that still gets you back to the pond for the evening.
            </p>
          </InfoCard>
          <InfoCard title="Gardner">
            <p>
              Groceries, coffee, restaurants, and the practical things you may
              want during a longer stay are close by.
            </p>
          </InfoCard>
          <InfoCard title="By train">
            <p>
              Wachusett Station on the Fitchburg Line is the useful commuter-rail
              stop for someone coming from Boston. Plan the last leg to the Lodge
              separately.
            </p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading
          eyebrow="The year at Kendall Pond"
          title="Different season, different kind of weekend."
        />
        <div className="info-grid info-grid-two">
          <InfoCard title="Summer">
            <p>
              Beach, dock, kayaks, paddle boat, long deck dinners, and the kind
              of days where leaving the property feels optional.
            </p>
          </InfoCard>
          <InfoCard title="Fall">
            <p>
              Cooler nights, foliage around the pond, and hot-tub weather. This
              is when the Lodge looks most obviously like New England.
            </p>
          </InfoCard>
          <InfoCard title="Winter">
            <p>
              Build the day around Wachusett, then come back to the fireplaces,
              hot tub, and a house where everyone can stay together.
            </p>
          </InfoCard>
          <InfoCard title="Spring">
            <p>
              Quieter weekends, open water returning, and more room to make the
              trip about the pond instead of a schedule.
            </p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">Have dates in mind?</p>
            <h2>Ask us about the weekend.</h2>
            <p>
              Tell us when you are coming and what brings you to the area. We
              will check the Lodge and send a complete quote.
            </p>
          </div>
          <div>
            <Link className="button button-primary" href="/book">Book your stay →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
