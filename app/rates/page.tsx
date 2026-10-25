import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { Icon } from "@/app/_components/Icons";
import { directBookingEnabled } from "@/lib/booking-db";

const bookingUrl =
  process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() ||
  "https://www.airbnb.com/rooms/1667597913565948713";

export const metadata: Metadata = {
  title: "Rates & Availability",
  description:
    "Check current dates and pricing for the Lodge at Kendall Pond on Airbnb.",
};

export default function RatesPage() {
  const directEnabled = directBookingEnabled();
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Dates and pricing"
        title="Rates & Availability."
        intro="See current dates and the exact checkout total on Airbnb. You can also request a direct quote when direct bookings are open."
        image="/images/kpl/pond.jpg"
        imageAlt="Kendall Pond beside the lodge with shoreline seating and open water"
        imagePosition="center 55%"
        secondaryAction={{ href: "/lodge", label: "See the house" }}
      />

      <section className="content-section">
        <div className="hero-actions">
          {directEnabled && <Link className="button button-secondary" href="/book">Request a direct quote</Link>}
          <a
            className="button button-primary"
            href={bookingUrl}
            rel="noreferrer"
            target="_blank"
          >
            Check dates on Airbnb <Icon name="arrow" size={18} />
          </a>
        </div>
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="Know the full price" title="Review every charge before booking" />
        <div className="info-grid info-grid-two">
          <InfoCard icon="house" title="Dates set the lodging total">
            <p>Rates vary by dates and stay length. Check the exact dates for a current price.</p>
          </InfoCard>
          <InfoCard icon="help" title="What changes the total">
            <p>
              Airbnb presents its checkout total before you pay. A direct quote itemizes lodging, cleaning, pets, taxes, and any other fee.
            </p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">Reserve the lodge</p>
            <h2>Reserve your stay.</h2>
            <p>
              Check exact dates and pricing on Airbnb, then confirm your stay
              in a few clicks.
            </p>
          </div>
          <div>
            <a
              className="button button-primary"
              href={bookingUrl}
              rel="noreferrer"
              target="_blank"
            >
              Reserve on Airbnb{" "}
              <span className="cta-subline">Available on Airbnb ↗</span>
            </a>
            <p className="booking-guest-link">
              <Link href="/guidebook">Guest with a code?</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
