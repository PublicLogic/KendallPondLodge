import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/_components/Icons";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";
import { StatBand } from "@/app/_components/StatBand";
import { directBookingEnabled } from "@/lib/booking-db";

export const metadata: Metadata = {
  description:
    "The Lodge at Kendall Pond: a private lakefront home in Gardner, Massachusetts with a hot tub, firepit, private dock, and room for up to eight guests.",
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
        intro="A whole lakefront home on Kendall Pond, with the deck, hot tub, firepit, dock, kayaks, and paddle boat right outside."
        image="/images/kpl/pond-seating.jpg"
        imageAlt="Furnished deck at the Lodge overlooking Kendall Pond"
        imagePosition="center"
        primaryAction={{
          href: directEnabled ? "/book" : airbnb,
          label: directEnabled ? "Book your stay" : "Reserve on Airbnb",
        }}
        secondaryAction={{ href: "/lodge", label: "See inside" }}
      />

      <StatBand
        stats={[
          { value: "8", label: "Guests" },
          { value: "3", label: "Bedrooms" },
          { value: "2", label: "Full baths" },
          { value: "Pondside", label: "Private beach & dock" },
        ]}
      />

      <section className="home-review-strip">
        <a href={`${airbnb}#reviews`} target="_blank" rel="noreferrer">
          <span>
            <strong>Guest Favorite on Airbnb</strong>
            <small>See current verified guest reviews</small>
          </span>
          <span className="home-review-arrow">Reviews ↗</span>
        </a>
      </section>

      <section className="content-section home-simple-story">
        <div className="home-simple-copy">
          <p className="eyebrow">Come for the water</p>
          <h2>Stay because it is easy to settle in.</h2>
          <p>
            Coffee on the deck. A swim or paddle from your own shoreline.
            Dinner with everyone around the kitchen. Then the hot tub or a fire
            by the pond when the day winds down.
          </p>
          <div className="home-inline-links">
            <Link href="/lodge">Tour the house →</Link>
            <Link href="/grounds">See the waterfront →</Link>
          </div>
        </div>

        <div className="photo-grid">
          <PhotoCard
            src="/images/kpl/great-room.jpg"
            alt="The cathedral-ceiling great room at the Lodge"
            title="Room to gather"
            note="Cathedral ceiling, fireplace, and space for the group"
            wide
          />
          <PhotoCard
            src="/images/kpl/hot-tub.jpg"
            alt="The covered hot tub looking toward Kendall Pond"
            title="Hot tub by the water"
            note="Covered patio, pond straight ahead"
          />
          <PhotoCard
            src="/images/kpl/pond.jpg"
            alt="Kendall Pond from the Lodge shoreline"
            title="Your shoreline"
            note="Private beach, dock, kayaks, and paddle boat"
          />
        </div>
      </section>

      <section className="content-section surface-section">
        <div className="home-host-panel">
          <div>
            <p className="eyebrow">Hosted by Nate & Allie</p>
            <h2>Come make a weekend of it.</h2>
            <p>
              We host the Lodge ourselves. Send us your dates and group size;
              we will check availability and send a complete direct quote
              before you pay anything.
            </p>
          </div>

          <div className="home-host-actions">
            {directEnabled ? (
              <Link className="button button-primary" href="/book">
                Book your stay <Icon name="arrow" size={18} />
              </Link>
            ) : (
              <a
                className="button button-primary"
                href={airbnb}
                target="_blank"
                rel="noreferrer"
              >
                Reserve on Airbnb <Icon name="arrow" size={18} />
              </a>
            )}
            <Link className="home-soft-link" href="/explore">Explore nearby →</Link>
            <Link className="home-soft-link" href="/guidebook">Already booked? Guest Guide →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
