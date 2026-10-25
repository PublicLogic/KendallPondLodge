import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "A simple guide to Gardner, Wachusett Mountain, nearby events, and getting to the Lodge at Kendall Pond.",
};

export default function ExplorePage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Around Kendall Pond"
        title="Leave the pond if you feel like it."
        intro="The Lodge can carry the whole weekend on its own. If you want to get out, Gardner, Wachusett, weddings, local food, and a few easy day plans are close enough."
        image="/images/kpl/fall-pond.webp"
        imageAlt="Kendall Pond surrounded by fall foliage"
        imagePosition="center 58%"
        primaryAction={{ href: "/area", label: "See the area" }}
        secondaryAction={{ href: "/events", label: "Visiting for an event?" }}
      />

      <section className="content-section">
        <SectionHeading
          eyebrow="A few easy directions"
          title="Build the weekend around what brought you here."
        />

        <div className="info-grid info-grid-three">
          <InfoCard title="Wachusett">
            <p>
              Ski, hike, or catch a seasonal event, then come back to the pond
              instead of ending the day in a hotel corridor.
            </p>
          </InfoCard>

          <InfoCard title="Gardner">
            <p>
              Coffee, groceries, restaurants, errands, and local stops are close
              enough that you do not have to plan every meal before you arrive.
            </p>
          </InfoCard>

          <InfoCard title="Weddings & gatherings">
            <p>
              The Polish American Citizens Club is a short walk from the Lodge,
              which makes the house especially easy for wedding weekends.
            </p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <div className="explore-arrival-strip">
          <div>
            <p className="eyebrow">Getting here</p>
            <h2>Mostly simple.</h2>
            <p>
              By car, Gardner is right off Route 2. For someone coming from
              Boston by commuter rail, Wachusett Station on the Fitchburg Line
              is the useful rail stop; plan the final ride to the Lodge
              separately.
            </p>
          </div>

          <div className="explore-arrival-links">
            <Link href="/area">Gardner & Wachusett →</Link>
            <Link href="/events">Wedding weekend details →</Link>
            <Link href="/book">Ask us about your dates →</Link>
          </div>
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="The seasons"
          title="The pond changes. The reason to come does not."
          intro="Summer is for the water. Fall is the show-off season. Winter puts Wachusett into the plan. Spring is quieter and usually easier to have to yourself."
        />

        <div className="photo-grid">
          <PhotoCard
            src="/images/kpl/fall-lodge.webp"
            alt="The Lodge at Kendall Pond in fall"
            title="Fall at the Lodge"
            note="Cool air, bright leaves, hot tub weather"
            wide
          />
          <PhotoCard
            src="/images/kpl/fall-lawn.webp"
            alt="The waterfront lawn in fall"
            title="Room outside"
            note="The lawn and pond stay part of the weekend"
          />
          <PhotoCard
            src="/images/kpl/fall-firepit.webp"
            alt="The shoreline firepit in fall"
            title="Later evenings"
            note="Firepit season gets better when the air cools"
          />
        </div>
      </section>

      <section className="content-section surface-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">Start with the Lodge</p>
            <h2>Then decide how much you want to leave it.</h2>
            <p>
              Send us your dates and group size. We will check availability and
              get you a direct quote.
            </p>
          </div>
          <div>
            <Link className="button button-primary" href="/book">
              Book your stay →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
