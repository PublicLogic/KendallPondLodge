import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/_components/Icons";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";
import { StatBand } from "@/app/_components/StatBand";
import { directBookingEnabled } from "@/lib/booking-db";

export const metadata: Metadata = {
  description: "Lakefront on Kendall Pond in Gardner, Massachusetts. Hot tub, firepit, private dock, and room for eight.",
};

const airbnb =
  process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() ||
  "https://www.airbnb.com/rooms/1667597913565948713";

export default function HomePage() {
  const directEnabled = directBookingEnabled();

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Kendall Pond · Gardner, Massachusetts"
        title="Your place by the pond."
        intro="Private shoreline. Hot tub. Firepit. Dock. Room for eight."
        image="/images/kpl/pond-seating.jpg"
        imageAlt="The Lodge overlooking Kendall Pond"
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
          { value: "Private", label: "Beach & dock" },
        ]}
      />

      <section className="home-review-strip">
        <a href={`${airbnb}#reviews`} target="_blank" rel="noreferrer">
          <strong>Guest Favorite on Airbnb</strong>
          <span className="home-review-arrow">Read reviews ↗</span>
        </a>
      </section>

      <section className="content-section home-simple-story">
        <div className="home-simple-copy">
          <p className="eyebrow">The good stuff</p>
          <h2>Swim. Paddle. Cook. Soak. Sit by the fire.</h2>
          <p>The house opens to the deck, patio, lawn, dock, and pond. Everything you came for is right there.</p>
          <div className="home-inline-links">
            <Link href="/lodge">Inside the Lodge →</Link>
            <Link href="/grounds">Waterfront →</Link>
          </div>
        </div>

        <div className="photo-grid">
          <PhotoCard
            src="/images/kpl/great-room.jpg"
            alt="The great room at the Lodge"
            title="Great room"
            note="Cathedral ceiling · fireplace · room to gather"
            wide
          />
          <PhotoCard
            src="/images/kpl/hot-tub.jpg"
            alt="The hot tub overlooking Kendall Pond"
            title="Hot tub"
            note="Covered patio · pond view"
          />
          <PhotoCard
            src="/images/kpl/pond.jpg"
            alt="Kendall Pond from the Lodge"
            title="Your shoreline"
            note="Beach · dock · kayaks · paddle boat"
          />
        </div>
      </section>

      <section className="content-section home-final-cta">
        <div>
          <p className="eyebrow">Hosted by Nate & Allie</p>
          <h2>Come stay.</h2>
          <p>Send your dates. We’ll check them and send the full price before you pay.</p>
        </div>
        <div className="home-host-actions">
          {directEnabled ? (
            <Link className="button button-primary" href="/book">
              Book your stay <Icon name="arrow" size={18} />
            </Link>
          ) : (
            <a className="button button-primary" href={airbnb} target="_blank" rel="noreferrer">
              Reserve on Airbnb <Icon name="arrow" size={18} />
            </a>
          )}
          <Link className="home-soft-link" href="/explore">Explore nearby →</Link>
          <Link className="home-soft-link" href="/guidebook">Guest Guide →</Link>
        </div>
      </section>
    </main>
  );
}
