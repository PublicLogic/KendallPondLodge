import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { directBookingEnabled, publicError } from "@/lib/booking-db";
import { requestStay } from "./actions";
import { BookingBrand } from "@/app/_components/BookingBrand";

export const metadata: Metadata = {
  title: "Book your stay",
  description:
    "Send your dates to Nate & Allie for a direct stay at the Lodge at Kendall Pond.",
};

export const dynamic = "force-dynamic";

const airbnb = "https://www.airbnb.com/rooms/1667597913565948713";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const enabled = directBookingEnabled();

  return (
    <main id="main-content" className="booking-page booking-page-direct">
      <section className="booking-above-fold">
        <div className="booking-intro">
          <div className="booking-intro-copy">
            <p className="eyebrow">Direct with Nate & Allie</p>
            <h1>Pick your dates.</h1>
            <p>No account. No charge. We’ll check the dates and send the full quote.</p>
            <div className="booking-intro-facts">
              <span>8 guests</span>
              <span>3 bedrooms</span>
              <span>2 baths</span>
              <span>Private shoreline</span>
            </div>
            <p className="booking-intro-links">
              <Link href="/lodge">See inside</Link>
              <Link href="/grounds">Waterfront</Link>
              <a href={airbnb} target="_blank" rel="noreferrer">Airbnb ↗</a>
            </p>
          </div>

          <figure className="booking-intro-photo">
            <Image
              src="/images/kpl/fall-pond.webp"
              alt="Kendall Pond in fall"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 42vw"
            />
          </figure>
        </div>

        <div className="booking-panel booking-panel-direct">
          <BookingBrand />
          <h2>Your stay.</h2>

          {status === "received" && (
            <p className="booking-alert" role="status">
              Request received. Nothing has been charged and the dates are not reserved yet.
            </p>
          )}

          {status && status !== "received" && (
            <p className="booking-alert" role="alert">
              {publicError(status)} Your dates are not reserved.
            </p>
          )}

          {!enabled ? (
            <p className="booking-alert">
              Direct requests are closed right now.{" "}
              <a href={airbnb}>Book on Airbnb instead.</a>
            </p>
          ) : (
            <form action={requestStay} className="booking-form booking-form-direct">
              <div className="booking-fields">
                <label>
                  Check in
                  <input name="check_in" type="date" required />
                </label>
                <label>
                  Check out
                  <input name="check_out" type="date" required />
                </label>
                <label>
                  Guests
                  <input name="guests" type="number" min="1" max="8" defaultValue="2" required />
                </label>
                <label>
                  Pets
                  <input name="pets" type="number" min="0" max="2" defaultValue="0" required />
                </label>
                <label>
                  Name
                  <input name="guest_name" type="text" autoComplete="name" maxLength={100} required />
                </label>
                <label>
                  Email
                  <input name="guest_email" type="email" autoComplete="email" maxLength={254} required />
                </label>
              </div>

              <label className="booking-note-field">
                Anything we should know? <span>(optional)</span>
                <textarea
                  name="note"
                  maxLength={1000}
                  placeholder="Wedding, ski trip, sleeping setup, pet..."
                />
              </label>

              <div className="booking-honeypot" aria-hidden="true">
                <label>
                  Website
                  <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <label className="booking-check booking-check-direct">
                <input type="checkbox" name="consent" value="yes" required />
                <span>This is a request, not a reservation. Nate or Allie may contact me about the stay.</span>
              </label>

              <div className="booking-submit-row">
                <button className="button button-primary" type="submit">Check my dates</button>
                <small>No charge now.</small>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="booking-direct-foot">
        <span>Full quote before payment.</span>
        <span>Deposit through Stripe.</span>
        <span>Booked only after payment is verified.</span>
      </section>
    </main>
  );
}
