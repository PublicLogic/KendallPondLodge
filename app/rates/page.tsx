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
        title="Booking options."
        intro={directEnabled
          ? "Send us a request for a direct quote, or book through Airbnb."
          : "Direct requests are temporarily closed. Check availability and pricing on Airbnb."}
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

      {directEnabled && <section className="content-section">
        <SectionHeading
          eyebrow="Booking directly"
          title="How direct requests work."
          intro="Choose your dates and group size. We’ll confirm availability, then send a full quote and deposit details."
        />
        <div className="info-grid info-grid-two">
          <InfoCard icon="house" title="No charge to ask">
            <p>Submitting a request does not reserve your dates or charge your card.</p>
          </InfoCard>
          <InfoCard icon="help" title="Full price before payment">
            <p>We’ll show nightly rates, fees, and deposit terms before payment.</p>
          </InfoCard>
        </div>
      </section>}

      <section className="content-section surface-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">Reservations</p>
            <h2>{directEnabled ? "Choose how to book." : "Reserve through Airbnb."}</h2>
            <p>{directEnabled
              ? "Request a quote from us, or use Airbnb to reserve."
              : "Our Airbnb listing has current availability and checkout details."}</p>
          </div>
          <div>
            {directEnabled && (
              <Link className="button button-primary" href="/book">
                Check dates <Icon name="arrow" size={18} />
              </Link>
            )}
            <p className="booking-guest-link">
              <a href={airbnb} target="_blank" rel="noreferrer">{directEnabled ? "Prefer Airbnb? Reserve there ↗" : "Check dates on Airbnb ↗"}</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
