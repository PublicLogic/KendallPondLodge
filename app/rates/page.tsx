import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/app/_components/PageHero";
import { Icon } from "@/app/_components/Icons";
import { BookingSteps, StayFAQ } from "@/app/_components/StayInformation";
import { directBookingEnabled, hostContactHref } from "@/lib/booking-db";

const airbnb =
  process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() ||
  "https://www.airbnb.com/rooms/1667597913565948713";

export const metadata: Metadata = {
  title: "Rates & Booking",
  alternates: { canonical: "/rates" },
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
        image="/images/kpl/2026-10-28/kendall-pond-lodge-deck-lounge-autumn.webp"
        imageAlt="Cushioned upper-deck seating overlooking Kendall Pond"
        imagePosition="center"
        primaryAction={
          directEnabled
            ? { href: "/book", label: "Request a direct quote" }
            : { href: airbnb, label: "Reserve on Airbnb" }
        }
        secondaryAction={{ href: "/lodge", label: "See inside" }}
      />

      {directEnabled && <BookingSteps />}

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
      <StayFAQ contactHref={hostContactHref()} />
    </main>
  );
}
