import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { Icon } from "@/app/_components/Icons";
import { directBookingEnabled } from "@/lib/booking-db";

const airbnb =
  process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() ||
  "https://www.airbnb.com/rooms/1667597913565948713";

export const metadata: Metadata = {
  title: "Rates & Booking",
  description:
    "Request a direct quote for the Lodge at Kendall Pond or book through Airbnb.",
};

export default function RatesPage() {
  const directEnabled = directBookingEnabled();

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Rates & booking"
        title="Book it your way."
        intro="Direct with us, or Airbnb. Full price first either way."
        image="/images/kpl/website-top-50/01-Hero/03-kendall-pond-lodge-lakeview-deck.jpg"
        imageAlt="The Lodge deck overlooking Kendall Pond"
        imagePosition="center"
        primaryAction={
          directEnabled
            ? { href: "/book", label: "Request a direct quote" }
            : { href: airbnb, label: "Reserve on Airbnb" }
        }
        secondaryAction={{ href: "/lodge", label: "See inside" }}
      />

      <section className="content-section">
        <SectionHeading
          eyebrow="Direct"
          title="Direct is simple."
          intro="Send the dates. We check them and send one itemized quote."
        />
        <div className="info-grid info-grid-two">
          <InfoCard icon="house" title="No charge to ask">
            <p>Ask first. Nothing is charged.</p>
          </InfoCard>
          <InfoCard icon="help" title="Full price before payment">
            <p>Everything is itemized before you pay.</p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">Choose what works for you</p>
            <h2>Book direct or use Airbnb.</h2>
            <p>Same Lodge. Pick the checkout you prefer.</p>
          </div>
          <div>
            {directEnabled && (
              <Link className="button button-primary" href="/book">
                Request direct <Icon name="arrow" size={18} />
              </Link>
            )}
            <p className="booking-guest-link">
              <a href={airbnb} target="_blank" rel="noreferrer">Prefer Airbnb? Reserve there ↗</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
