import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Explore the Lodge at Kendall Pond, the waterfront, Gardner, nearby events, and the seasons around the pond.",
};

export default function ExplorePage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Kendall Pond · Gardner, Massachusetts"
        title="Explore from here."
        intro="Stay on the water, wander into Gardner, head toward Wachusett, or keep the whole weekend within sight of the dock."
        image="/images/kpl/fall-pond.webp"
        imageAlt="Kendall Pond surrounded by fall foliage"
        imagePosition="center 58%"
        primaryAction={{ href: "/lodge", label: "Explore the lodge" }}
        secondaryAction={{ href: "/area", label: "See the area" }}
      />

      <section className="content-section">
        <SectionHeading
          eyebrow="Start here"
          title="The lodge is the destination. The area gives you options."
          intro="You can build a full weekend without going far, or use the lodge as a quiet home base for Wachusett, Gardner, weddings, family weekends, and everything around them."
        />

        <div className="info-grid info-grid-two">
          <InfoCard title="The Lodge">
            <p>
              Three bedrooms, room for up to eight, a vaulted great room, and an
              open kitchen made for gathering. <Link href="/lodge">See inside →</Link>
            </p>
          </InfoCard>

          <InfoCard title="Waterfront & grounds">
            <p>
              Private shoreline, dock, kayaks, hot tub, firepit, and room to
              spend the day outside. <Link href="/grounds">Go to the water →</Link>
            </p>
          </InfoCard>

          <InfoCard title="Around Gardner">
            <p>
              Downtown Gardner, local stops, and Wachusett Mountain are close
              enough to make the lodge an easy base. <Link href="/area">Explore the area →</Link>
            </p>
          </InfoCard>

          <InfoCard title="Events & weekends">
            <p>
              In town for a wedding or nearby gathering? The lodge works as a
              quieter place to come back to. <Link href="/events">Plan an event stay →</Link>
            </p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading
          eyebrow="Fall on the pond"
          title="One property. A completely different mood every few weeks."
          intro="The recovered production photography was too good to leave behind."
        />

        <div className="photo-grid">
          <PhotoCard
            src="/images/kpl/fall-lodge.webp"
            alt="The Lodge at Kendall Pond in fall foliage"
            title="The lodge"
            note="Fall at Kendall Pond"
            wide
          />
          <PhotoCard
            src="/images/kpl/fall-lawn.webp"
            alt="The waterfront lawn during fall"
            title="The lawn"
            note="Room to slow down"
          />
          <PhotoCard
            src="/images/kpl/fall-firepit.webp"
            alt="The lakeside firepit in fall"
            title="The firepit"
            note="Cooler evenings by the water"
          />
        </div>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">Your dates</p>
            <h2>Make the pond your home base.</h2>
            <p>
              See the lodge first, then request a direct stay with every charge
              and term shown before payment.
            </p>
          </div>
          <div>
            <Link className="button button-primary" href="/book">
              Request a stay →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
