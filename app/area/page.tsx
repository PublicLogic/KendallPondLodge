import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";

export const metadata: Metadata = {
  title: { absolute: "Gardner, MA Area & Travel Guide | The Lodge at Kendall Pond" },
  description: "Plan your arrival at Kendall Pond in Gardner, Massachusetts: Route 2, Fitchburg Line travel, driveway parking, check-in, and practical details for your stay.",
  alternates: { canonical: "/area" },
};

export default function AreaPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Gardner, Massachusetts"
        title="Getting to Kendall Pond."
        intro="The Lodge is a waterfront house in Gardner. Plan your trip into town, then use the private arrival details we send for your confirmed stay."
        image="/images/kpl/website-top-50/09-Waterfront-and-Grounds/46-kendall-pond-lodge-autumn-pond-and-dock.jpg"
        imageAlt="Kendall Pond from the Lodge"
        imagePosition="center 55%"
        primaryAction={{ href: "/book", label: "Check dates" }}
        secondaryAction={{ href: "/explore", label: "Local things to do" }}
      />

      <section className="content-section">
        <div className="info-grid info-grid-three">
          <InfoCard title="Driving to Gardner">
            <p>Gardner is off Route 2 in north-central Massachusetts. Use your confirmed reservation’s arrival message for the house address and final directions.</p>
            <p>Check your route for the day you travel, especially in winter weather.</p>
          </InfoCard>
          <InfoCard title="Coming by train">
            <p>Wachusett Station is on the <a href="https://www.mbta.com/schedules/CR-Fitchburg">MBTA Fitchburg Line from Boston’s North Station</a>. Check the current timetable and service alerts before making plans.</p>
            <p>You’ll need to arrange a ride from the station to the Lodge, as well as transportation for any outings during your stay.</p>
          </InfoCard>
          <InfoCard title="Parking at the house">
            <p>Free parking is available in the driveway. Let us know how many vehicles you plan to bring before booking.</p>
            <p>The house has multiple levels, an upper deck, and a lower patio. Ask us about any mobility needs so you can decide whether the layout works for your group.</p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="Before you arrive" title="Plan the practical parts." />
        <div className="info-grid info-grid-two">
          <InfoCard title="Arrival and departure" href="/rates#before-you-book" linkLabel="Read the stay details">
            <p>Standard check-in is 3 p.m. and checkout is 11 a.m. Self check-in instructions are sent privately.</p>
            <p>If your plans need an earlier arrival or later departure, ask before booking. A different time needs advance agreement and depends on the calendar.</p>
          </InfoCard>
          <InfoCard title="Meals at the house" href="/explore" linkLabel="Find coffee, dinner, and a day out">
            <p>The Lodge has a kitchen and dining space for meals together. Plan a grocery stop for the breakfasts, dinners, and snacks you want at the house.</p>
            <p>For meals out, our local guide includes Cafe Edesia and Gardner Ale House, along with ideas for Wachusett and Fitchburg.</p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel">
          <div><p className="eyebrow">Plan your stay</p><h2>Have your dates in mind?</h2><p>Send a request for your nights and group. We’ll confirm availability and send the full quote before payment.</p></div>
          <Link className="button button-primary" href="/book">Check dates →</Link>
        </div>
      </section>
    </main>
  );
}
