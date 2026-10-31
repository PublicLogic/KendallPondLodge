import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/app/_components/PageHero";
import { lodgePhoto } from "@/app/_data/lodge-photos";
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
    "Check dates and pricing for the Lodge at Kendall Pond. Choose direct booking when available or use Airbnb.",
};

export default function RatesPage() {
  const directEnabled = directBookingEnabled();

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Dates & pricing"
        title="Find your nights."
        intro={directEnabled
          ? "See available dates and the full price before deciding. You can also book on Airbnb if you prefer."
          : "Direct requests are temporarily closed. Check availability and pricing on Airbnb."}
        image={lodgePhoto(31).src}
        imageAlt={lodgePhoto(31).alt}
        imagePosition="center"
        primaryAction={
          directEnabled
            ? { href: "/book", label: "Check dates & price" }
            : { href: airbnb, label: "Reserve on Airbnb" }
        }
        secondaryAction={{ href: "/lodge", label: "See inside" }}
      />

      {directEnabled && <BookingSteps />}

      <section className="content-section surface-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">Reservations</p>
            <h2>{directEnabled ? "Your stay starts with the dates." : "Reserve through Airbnb."}</h2>
            <p>{directEnabled
              ? "Cleaning is included in the stay price. Pet fees, if applicable, and taxes are shown before payment. Compare the full total with Airbnb before deciding."
              : "Our Airbnb listing has current availability and checkout details."}</p>
          </div>
          <div>
            {directEnabled && (
              <Link className="button button-primary" href="/book">
                Check dates &amp; price <Icon name="arrow" size={18} />
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
