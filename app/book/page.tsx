import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/app/_components/PageHero";
import { directBookingEnabled, publicError } from "@/lib/booking-db";
import { requestStay } from "./actions";
import { BookingBrand } from "@/app/_components/BookingBrand";

export const metadata: Metadata = {
  title: "Book your stay",
  description:
    "Send your dates to Nate & Allie for a direct stay at the Lodge at Kendall Pond. We verify availability and send a complete quote before any payment.",
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
    <main id="main-content" className="booking-page">
      <PageHero
        eyebrow="Direct with Nate & Allie"
        title="Send us your dates."
        intro="Tell us when you want to come, who is coming, and anything we should know. We will check the calendar and send the complete price and terms before you pay."
        image="/images/kpl/pond-seating.jpg"
        imageAlt="The deck at the Lodge overlooking Kendall Pond"
        imagePosition="center"
        secondaryAction={{ href: "/lodge", label: "See inside first" }}
      />

      <section className="content-section booking-grid">
        <div>
          <p className="eyebrow">How direct booking works</p>
          <h2>A request first. A quote next.</h2>
          <p>
            Sending this form does not reserve the Lodge and does not charge
            you. We check the Airbnb calendar, confirm that the dates fit, and
            prepare an itemized private quote.
          </p>
          <p>
            The quote shows the lodging price, cleaning, pets, taxes, any other
            fee, the deposit due now, the remaining balance, and the exact
            cancellation terms before you decide.
          </p>
          <ol className="booking-steps">
            <li>Send your dates and group size.</li>
            <li>We check availability and prepare the quote.</li>
            <li>You review the full terms and pay the deposit through Stripe.</li>
            <li>Your stay is booked only after payment is verified and recorded.</li>
          </ol>
          <p>
            Prefer Airbnb?{" "}
            <a href={airbnb} target="_blank" rel="noreferrer">
              Book there instead ↗
            </a>
          </p>
        </div>

        <div className="booking-panel">
          <BookingBrand />
          <p className="eyebrow">Your stay</p>
          <h2>Ask about these dates.</h2>
          <p>No account or sign-in needed.</p>

          {status === "received" && (
            <p className="booking-alert" role="status">
              We got your request. Nothing has been charged and the dates are
              not reserved yet. We will review the stay and follow up with the
              next step.
            </p>
          )}

          {status && status !== "received" && (
            <p className="booking-alert" role="alert">
              {publicError(status)} Your dates are not reserved.
            </p>
          )}

          {!enabled ? (
            <p className="booking-alert">
              Direct requests are not open right now. You can still{" "}
              <a href={airbnb}>book the Lodge on Airbnb</a>.
            </p>
          ) : (
            <form action={requestStay} className="booking-form">
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
                  <input
                    name="guests"
                    type="number"
                    min="1"
                    max="8"
                    defaultValue="2"
                    required
                  />
                </label>
                <label>
                  Dogs / pets
                  <input
                    name="pets"
                    type="number"
                    min="0"
                    max="2"
                    defaultValue="0"
                    required
                  />
                </label>
                <label>
                  Your name
                  <input
                    name="guest_name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    name="guest_email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                  />
                </label>
              </div>

              <label>
                Anything we should know? <span>(optional)</span>
                <textarea
                  name="note"
                  maxLength={1000}
                  placeholder="Wedding weekend, ski plans, sleeping setup, a pet, an amenity that matters to the trip..."
                />
              </label>

              <div className="booking-honeypot" aria-hidden="true">
                <label>
                  Website
                  <input
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>

              <label className="booking-check">
                <input
                  type="checkbox"
                  name="consent"
                  value="yes"
                  required
                />
                I understand this is a request, not a reservation, and Nate or
                Allie may contact me about this stay.
              </label>

              <button className="button button-primary" type="submit">
                Send my dates
              </button>

              <p className="booking-fine">
                No charge now. We use these details only to review and respond
                to this stay request.
              </p>
            </form>
          )}
        </div>
      </section>

      <section className="content-section surface-section">
        <h2>What you are asking about</h2>
        <p>
          A whole lakefront home for up to eight with a private shoreline,
          dock, seasonal kayaks and paddle boat, hot tub, firepit, open kitchen,
          cathedral-ceiling great room, and three bedrooms.{" "}
          <Link href="/lodge">Tour the house</Link> or{" "}
          <Link href="/grounds">see the waterfront</Link>.
        </p>
        <p>
          Check-in is after 3 PM and checkout is by 11 AM. Quiet hours are
          10 PM–7 AM. No smoking. An exterior Ring doorbell camera faces the
          entrance.
        </p>
      </section>
    </main>
  );
}
