import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/_components/Icons";
import { InfoCard, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";
import { StatBand } from "@/app/_components/StatBand";
import { directBookingEnabled } from "@/lib/booking-db";

export const metadata: Metadata = {
  description:
    "The Lodge at Kendall Pond: a private lakefront home in Gardner, Massachusetts with a hot tub, private dock, and room for up to eight guests.",
};

const airbnb =
  process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() ||
  "https://www.airbnb.com/rooms/1667597913565948713";

export default function HomePage() {
  const directEnabled = directBookingEnabled();

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Gardner, Massachusetts"
        title="Your place by the pond."
        intro="Lakefront on Kendall Pond with a hot tub, firepit, private dock, kayaks, paddle boat, and a whole house that works just as well for doing nothing as it does for a full weekend."
        image="/images/kpl/pond-seating.jpg"
        imageAlt="Furnished deck at the Lodge overlooking Kendall Pond"
        imagePosition="center"
        primaryAction={{
          href: directEnabled ? "/book" : airbnb,
          label: directEnabled ? "Book your stay" : "Reserve on Airbnb",
        }}
        secondaryAction={{ href: "/lodge", label: "See the Lodge" }}
      />

      <StatBand
        stats={[
          { value: "8", label: "Guests" },
          { value: "3", label: "Bedrooms" },
          { value: "2", label: "Bathrooms" },
          { value: "Pondside", label: "Private beach & dock" },
        ]}
      />

      <section className="home-review-strip">
        <a href={`${airbnb}#reviews`} target="_blank" rel="noreferrer">
          <span>
            <strong>Guest Favorite on Airbnb</strong>
            <small>Read current verified guest reviews</small>
          </span>
          <span className="home-review-arrow">Reviews ↗</span>
        </a>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="The house and the water"
          title="The house opens right onto the water."
          intro="Walk out from the lower level to the patio, hot tub, firepit, lawn, dock, kayaks, and paddle boat. Upstairs, the deck keeps the pond in view while everyone spreads out inside."
        />

        <div className="photo-grid">
          <PhotoCard
            src="/images/kpl/fall-lodge.webp"
            alt="The Lodge at Kendall Pond from the lawn"
            title="The Lodge"
            note="Lakefront home, deck, patio, and lawn"
            wide
          />
          <PhotoCard
            src="/images/kpl/great-room.jpg"
            alt="The vaulted great room with fireplace"
            title="The great room"
            note="Cathedral ceiling, fireplace, room to gather"
          />
          <PhotoCard
            src="/images/kpl/hot-tub.jpg"
            alt="The covered hot tub overlooking Kendall Pond"
            title="The hot tub"
            note="Covered soak with the pond straight ahead"
          />
        </div>

        <div className="home-inline-links">
          <Link href="/lodge">Inside the Lodge →</Link>
          <Link href="/grounds">Down by the water →</Link>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading
          eyebrow="What's here"
          title="You do not need much of an itinerary."
        />

        <div className="info-grid info-grid-two">
          <InfoCard title="Beach & dock">
            <p>Private shoreline and dock with kayaks and a paddle boat in season. Swim, launch, float, or sit by the water.</p>
          </InfoCard>
          <InfoCard title="Hot tub & firepit">
            <p>The covered hot tub looks out toward the pond, and the firepit sits closer to the shoreline for later nights outside.</p>
          </InfoCard>
          <InfoCard title="Sleeps up to eight">
            <p>Three bedrooms, two full baths, a queen pull-out, a large sectional, and enough shared space that a full group still has room.</p>
          </InfoCard>
          <InfoCard title="Dogs welcome">
            <p>Up to two dogs are welcome. Add them to your request so we can quote the stay correctly and have the house ready.</p>
          </InfoCard>
        </div>

        <p className="booking-fine">
          Boats, pool, and other outdoor amenities can be seasonal. If one matters to your trip, ask before booking.
        </p>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Make a weekend of it"
          title="Come for the pond. Build the rest around it."
        />

        <div className="info-grid info-grid-three">
          <InfoCard title="A weekend by the water" href="/grounds" linkLabel="See the waterfront">
            <p>Morning coffee on the deck, an afternoon on the water, dinner outside, then the hot tub or firepit when the light goes down.</p>
          </InfoCard>
          <InfoCard title="A wedding close by" href="/events" linkLabel="Visiting for an event">
            <p>The Polish American Citizens Club is only a short walk away, so wedding groups can stay together without making the ride home part of the plan.</p>
          </InfoCard>
          <InfoCard title="A Wachusett getaway" href="/area" linkLabel="Explore the area">
            <p>Wachusett Mountain makes an easy ski, hike, or festival day; the Lodge gives you somewhere better to come back to afterward.</p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section">
        <div className="home-arrival-panel">
          <div>
            <p className="eyebrow">Getting here</p>
            <h2>Easy by car. Possible by train.</h2>
            <p>Gardner sits right off Route 2. If someone in your group is coming from Boston by commuter rail, Wachusett Station on the Fitchburg Line is the useful stop; plan the last leg to the Lodge separately.</p>
          </div>
          <div className="home-arrival-links">
            <Link href="/events"><strong>Visiting for an event?</strong><span>PACC and nearby celebrations →</span></Link>
            <Link href="/area"><strong>Making a Wachusett weekend?</strong><span>Mountain, Gardner, and seasonal ideas →</span></Link>
            <Link href="/explore"><strong>Just looking around?</strong><span>Food, local stops, and things to do →</span></Link>
          </div>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="Before you book" title="A few useful answers." />

        <div className="faq-list">
          <details>
            <summary>Do we have the place to ourselves?</summary>
            <p>Yes. Your stay includes the whole house and yard, with no other guest group staying on the property.</p>
          </details>
          <details>
            <summary>How does a full group sleep?</summary>
            <p>The Lodge has a king room, queen room, bunk room, and additional sleeping space. For a larger group, tell us how you plan to use the beds when you request your dates.</p>
          </details>
          <details>
            <summary>Can we bring our pets?</summary>
            <p>Yes. Up to two pets are welcome. Include them in your request so the quote reflects your stay accurately.</p>
          </details>
          <details>
            <summary>How does direct booking work?</summary>
            <p>Send your dates first. We verify availability and prepare an itemized quote. You see the full price and terms before paying a deposit. A request alone is not a reservation.</p>
          </details>
        </div>
      </section>

      <section className="content-section">
        <div className="home-host-panel">
          <div>
            <p className="eyebrow">Your hosts</p>
            <h2>Hi, we're Nate & Allie.</h2>
            <p>We host the Lodge ourselves and know the house well. If you are trying to figure out sleeping arrangements, pets, a wedding weekend, ski plans, or whether a certain amenity will be available for your dates, ask us.</p>
          </div>
          <a className="button button-secondary" href={airbnb} target="_blank" rel="noreferrer">
            Read guest reviews ↗
          </a>
        </div>
      </section>

      <section className="content-section surface-section">
        <div className="home-quick-grid">
          <Link className="home-quick-card" href="/guidebook">
            <p className="eyebrow">Already booked?</p>
            <h2>Open the Guest Guide.</h2>
            <p>Arrival, the house, waterfront guidance, audio, and checkout in one place.</p>
            <span>Open Guide →</span>
          </Link>

          <Link className="home-quick-card" href="/explore">
            <p className="eyebrow">Explore</p>
            <h2>See what is around you.</h2>
            <p>Food, local stops, events, Gardner, and nearby places worth leaving the pond for.</p>
            <span>Explore nearby →</span>
          </Link>
        </div>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">We'd love to have you</p>
            <h2>Send us your dates.</h2>
            <p>We will check availability and prepare a complete quote before you pay anything.</p>
          </div>

          <div>
            {directEnabled ? (
              <>
                <Link className="button button-primary" href="/book">
                  Book your stay <Icon name="arrow" size={18} />
                </Link>
                <p className="booking-guest-link">
                  <a href={airbnb} target="_blank" rel="noreferrer">Prefer Airbnb? Book there ↗</a>
                </p>
              </>
            ) : (
              <a className="button button-primary" href={airbnb} target="_blank" rel="noreferrer">
                Reserve on Airbnb <Icon name="arrow" size={18} />
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
