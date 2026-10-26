import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { directBookingEnabled } from "@/lib/booking-db";

export const metadata: Metadata = {
  title: "The Lodge at Kendall Pond",
  description:
    "A private lake house on Kendall Pond in Gardner, Massachusetts — hot tub, private dock, kayaks, firepit and room for eight.",
};

const airbnb =
  process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() ||
  "https://www.airbnb.com/rooms/1667597913565948713";

export default function HomePage() {
  const directEnabled = directBookingEnabled();

  const bookingHref = directEnabled ? "/book" : airbnb;

  return (
    <main
      id="main-content"
      className="hospitality-home"
    >
      <section className="hospitality-cover">
        <Image
          alt="Kendall Pond in fall"
          className="hospitality-cover-image"
          fill
          priority
          sizes="100vw"
          src="/images/kpl/fall-pond.webp"
        />

        <div
          className="hospitality-cover-shade"
          aria-hidden="true"
        />

        <div className="hospitality-cover-copy">
          <p className="hospitality-kicker">
            Kendall Pond · Gardner, Massachusetts
          </p>

          <h1>The Lodge at Kendall Pond</h1>

          <p className="hospitality-lead">
            A private lake house for weekends that
            don’t need an itinerary.
          </p>

          <div className="hospitality-cover-actions">
            {directEnabled ? (
              <Link
                className="hospitality-primary-action"
                href={bookingHref}
              >
                Check dates
              </Link>
            ) : (
              <a
                className="hospitality-primary-action"
                href={bookingHref}
                rel="noreferrer"
                target="_blank"
              >
                Check dates
              </a>
            )}

            <Link
              className="hospitality-text-action"
              href="/lodge"
            >
              See the Lodge
            </Link>
          </div>

          <div className="hospitality-cover-facts">
            <span>Sleeps 8</span>
            <span>Private dock</span>
            <span>Hot tub</span>
            <span>3 bedrooms</span>
          </div>
        </div>
      </section>

      <section className="hospitality-proof">
        <a
          href={`${airbnb}#reviews`}
          rel="noreferrer"
          target="_blank"
        >
          <span>
            <small>Guest Favorite</small>
            <strong>Guests come for the pond.</strong>
          </span>

          <span>Read Airbnb reviews ↗</span>
        </a>
      </section>

      <section className="hospitality-story">
        <figure className="hospitality-story-image">
          <Image
            alt="The Lodge at Kendall Pond in autumn"
            fill
            sizes="(max-width: 800px) 100vw, 55vw"
            src="/images/kpl/fall-lodge.webp"
          />
        </figure>

        <div className="hospitality-story-copy">
          <p className="hospitality-kicker">
            Nothing complicated
          </p>

          <h2>Lake days. Long dinners. Fire after dark.</h2>

          <p>
            The house opens straight into the reason
            you came: the deck, lawn, shoreline, dock
            and water. Paddle out in the morning.
            Soak at night. Stay in if the weather turns.
          </p>

          <div className="hospitality-story-links">
            <Link href="/lodge">Inside the Lodge →</Link>
            <Link href="/grounds">The Pond →</Link>
          </div>
        </div>
      </section>

      <section
        className="hospitality-gallery"
        aria-label="A look at the Lodge"
      >
        <figure className="hospitality-gallery-large">
          <Image
            alt="Great room at the Lodge"
            fill
            sizes="(max-width: 800px) 100vw, 58vw"
            src="/images/kpl/great-room.jpg"
          />
          <figcaption>Room to be together.</figcaption>
        </figure>

        <figure>
          <Image
            alt="Firepit by Kendall Pond"
            fill
            sizes="(max-width: 800px) 100vw, 42vw"
            src="/images/kpl/fall-firepit.webp"
          />
          <figcaption>Stay out after sunset.</figcaption>
        </figure>

        <figure>
          <Image
            alt="Kendall Pond shoreline"
            fill
            sizes="(max-width: 800px) 100vw, 42vw"
            src="/images/kpl/pond-seating.jpg"
          />
          <figcaption>Your shoreline for the stay.</figcaption>
        </figure>
      </section>

      <section className="hospitality-final">
        <div>
          <p className="hospitality-kicker">
            Hosted by Nate &amp; Allie
          </p>

          <h2>Come stay by the water.</h2>

          <p>
            Pick your dates. We’ll check the live
            calendar and send the full price before
            anything is charged.
          </p>
        </div>

        <div className="hospitality-final-actions">
          {directEnabled ? (
            <Link
              className="hospitality-primary-action"
              href="/book"
            >
              Check dates
            </Link>
          ) : (
            <a
              className="hospitality-primary-action"
              href={airbnb}
              rel="noreferrer"
              target="_blank"
            >
              Reserve on Airbnb
            </a>
          )}

          <Link
            className="hospitality-text-action hospitality-text-action-dark"
            href="/explore"
          >
            Around here →
          </Link>
        </div>
      </section>
    </main>
  );
}
