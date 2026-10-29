import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PondScenery } from "@/app/_components/PondScenery";
import { PhotoCard } from "@/app/_components/PhotoCard";

export const metadata: Metadata = {
  title: { absolute: "Things to Do Near Gardner, MA | The Lodge at Kendall Pond" },
  description: "Plan a stay on Kendall Pond with local coffee and dinner, Wachusett hikes, Fitchburg Art Museum, and a place to stay for a Gardner wedding.",
  alternates: { canonical: "/explore" },
};

export default function ExplorePage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Around Gardner"
        title="A few days around Gardner."
        intro="Breakfast in town, a walk at Wachusett, and dinner back at the house. Here are a few local places to help you plan your stay."
        image="/images/kpl/2026-10-28/kendall-pond-lodge-dawn-mist.webp"
        imageAlt="Morning mist over still water at Kendall Pond"
        imagePosition="center 58%"
        primaryAction={{ href: "/book", label: "Check dates" }}
        secondaryAction={{ href: "/area", label: "Getting here" }}
      />

      <section className="content-section">
        <SectionHeading eyebrow="Make a little room in the week" title="Three ways to spend your stay." />
        <div className="info-grid info-grid-three">
          <InfoCard title="A quiet midweek">
            <p>Start with breakfast at <a href="https://cafeedesia.toast.site/">Cafe Edesia in Gardner</a>, then head back for an afternoon at the house.</p>
            <p>For dinner out, <a href="https://www.moonhillbrewing.com/">Gardner Ale House &amp; Moon Hill Brewing</a> has a restaurant and brewery downtown. Or cook together and spend the evening by the fireplace.</p>
          </InfoCard>
          <InfoCard title="An autumn day outside">
            <p>Plan a hike at <a href="https://www.mass.gov/locations/wachusett-mountain-state-reservation">Wachusett Mountain State Reservation</a>. Check the official trail and access information for your date before setting out.</p>
            <p>Leave time to get back to the Lodge for a soak in the hot tub and a meal overlooking the pond.</p>
          </InfoCard>
          <InfoCard title="A wedding weekend" href="/events" linkLabel="Plan a wedding guest stay">
            <p>Coming to a wedding in Gardner? Share the house with your group, with three bedrooms, two full bathrooms, and a kitchen for breakfast the next morning.</p>
            <p>The Lodge accommodates up to eight overnight guests. Check the sleeping plan before you decide who is staying.</p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="Keep the season in mind" title="A different plan for a different day." intro="Use the official links for current hours, access, and conditions." />
        <div className="info-grid info-grid-two">
          <InfoCard title="When it is cold or rainy">
            <p><a href="https://fitchburgartmuseum.org/visit/">Fitchburg Art Museum</a> is an indoor option for an afternoon out. Look at the exhibitions and visitor information before you go; the museum is not open every day.</p>
            <p>Staying in works, too: the great room, kitchen, and pond views are all part of the house.</p>
          </InfoCard>
          <InfoCard title="When ski season arrives">
            <p>For a winter visit, start with <a href="https://www.wachusett.com/first-time-visitor-guide/">Wachusett Mountain’s visitor guide</a> and check the <a href="https://www.wachusett.com/the-mountain/your-visit/snow-report/">current snow report</a> before planning a ski day.</p>
            <p>Skiing depends on the season and operating conditions. Dock use and boating at the Lodge also depend on the season; ask us about any outdoor amenity that matters to your trip.</p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel kpl-pond-ambient">
          <PondScenery scene="explore" />
          <div><p className="eyebrow">Have a few days in mind?</p><h2>See which nights work.</h2><p>Send your dates and group size. We’ll check availability and send the full quote before you pay.</p></div>
          <Link className="button button-primary" href="/book">Check dates →</Link>
        </div>
      </section>

      <section className="content-section">
        <div className="photo-grid">
          <PhotoCard src="/images/kpl/2026-10-28/kendall-pond-lodge-autumn-lawn-premium.webp" alt="Autumn trees framing the Lodge, lawn and stone firepit" title="The Lodge in fall" note="Autumn foliage around the house" wide />
          <PhotoCard src="/images/kpl/2026-10-28/kendall-pond-lodge-summer-lawn-premium.webp" alt="The Lodge, stone firepit, lawn and shoreline lounge chair in summer" title="The waterfront lawn" note="Lawn between the house and shoreline" />
          <PhotoCard src="/images/kpl/website-top-50/01-Hero/02-kendall-pond-lodge-autumn-waterfront.jpg" alt="Autumn reflections above the private shoreline and firepit" title="Firepit by the water" note="Shoreline seating in autumn" />
        </div>
      </section>
    </main>
  );
}
