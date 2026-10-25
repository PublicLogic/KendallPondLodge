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
        intro="A whole lakefront home for up to eight, with a hot tub, private dock, and room to settle in. Bring the dog. Make a weekend of it."
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
          title="Everything points back to the pond."
          intro="The Lodge gives a group room to spread out inside, then pulls everyone back outside to the deck, hot tub, lawn, firepit, and private shoreline."
        />

        <div className="photo-grid">
          <PhotoCard
            src="/images/kpl/fall-lodge.webp"
            alt="The Lodge at Kendall Pond from the lawn"
            title="The Lodge"
            note="A whole home by the water"
            wide
          />
          <PhotoCard
            src="/images/kpl/great-room.jpg"
            alt="The vaulted great room with fireplace"
            title="The great room"
            note="Where everyone ends up"
          />
          <PhotoCard
            src="/images/kpl/hot-tub.jpg"
            alt="The covered hot tub overlooking Kendall Pond"
            title="The hot tub"
            note="Pond view from the lower patio"
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
          title="Enough to make staying in the plan."
        />

        <div className="info-grid info-grid-two">
          <InfoCard title="Beach & dock">
            <p>Private beach and dock, with kayaks and seasonal water equipment.</p>
          </InfoCard>
          <InfoCard title="Hot tub & firepit">
            <p>A covered hot tub on the patio and a firepit down by the shore.</p>
          </InfoCard>
          <InfoCard title="Sleeps up to eight">
            <p>Three bedrooms, multiple gathering spaces, and two full baths.</p>
          </InfoCard>
          <InfoCard title="Dogs welcome">
            <p>Up to two pets are welcome. Include them when you request your stay.</p>
          </InfoCard>
        </div>

        <p className="booking-fine">
          Boats, pool, and other outdoor amenities can be seasonal. If one matters to your trip, ask before booking.
        </p>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Make a weekend of it"
          title="One home. A few good reasons to come."
        />

        <div className="info-grid info-grid-three">
          <InfoCard title="A weekend by the water" href="/grounds" linkLabel="See the waterfront">
            <p>Coffee on the deck, time by the pond, a soak in the hot tub, and nowhere you need to be.</p>
          </InfoCard>
          <InfoCard title="A wedding close by" href="/events" linkLabel="Visiting for an event">
            <p>The Polish American Citizens Club is about a three-minute walk away, making the Lodge an easy wedding-weekend home base.</p>
          </InfoCard>
          <InfoCard title="A Wachusett getaway" href="/area" linkLabel="Explore the area">
            <p>Wachusett Mountain is close enough for skiing, hiking, and seasonal events, with the pond waiting when you get back.</p>
          </InfoCard>
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
            <p>We host the Lodge ourselves. Questions about the house, the pond, or whether your dates are a good fit? Send the request and one of us will get back to you.</p>
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
