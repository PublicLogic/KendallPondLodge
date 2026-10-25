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
        title="Two ways to book."
        intro="Request a direct quote from us, or use Airbnb if you prefer its calendar and checkout. Either way, you see the full price before you commit."
        image="/images/kpl/pond-seating.jpg"
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
          title="Ask us for the exact stay."
          intro="Send the dates, guest count, and pets. We check availability and send an itemized quote with the deposit, remaining balance, and cancellation terms before you pay."
        />
        <div className="info-grid info-grid-two">
          <InfoCard icon="house" title="No charge to ask">
            <p>
              A request is not a reservation and does not charge a card. It is
              simply the first step toward a direct stay.
            </p>
          </InfoCard>
          <InfoCard icon="help" title="Full price before payment">
            <p>
              Your quote shows lodging, cleaning, pets, taxes, any other fee,
              the deposit due, remaining balance, and cancellation terms.
            </p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">Choose what works for you</p>
            <h2>Book direct or use Airbnb.</h2>
            <p>
              Direct keeps the conversation with us. Airbnb gives you its own
              calendar, payment flow, and booking protections.
            </p>
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
