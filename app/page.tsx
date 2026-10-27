import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { lodgePhoto } from "@/app/_data/lodge-photos";
import { directBookingEnabled } from "@/lib/booking-db";

export const metadata: Metadata = {
  title: "The Lodge at Kendall Pond | Private Waterfront Stay in Gardner, MA",
  description:
    "Three-bedroom waterfront house in Gardner, Massachusetts. Sleeps eight, with a private dock, deck, hot tub and firepit on Kendall Pond.",
};

const airbnb =
  process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() ||
  "https://www.airbnb.com/rooms/1667597913565948713";

const moments = [
  {
    order: 42,
    title: "The dock and shoreline",
    detail: "The lawn leads down to Kendall Pond and the private dock.",
    href: "/grounds",
    link: "See the waterfront",
  },
  {
    order: 4,
    title: "Hot tub under the deck",
    detail: "The covered patio and hot tub overlook the pond.",
    href: "/grounds",
    link: "See the outdoor spaces",
  },
  {
    order: 5,
    title: "The great room",
    detail: "Tall ceilings, a fireplace, and room for everyone to sit together.",
    href: "/lodge",
    link: "Step inside",
  },
  {
    order: 35,
    title: "The upper deck",
    detail: "Outdoor dining and lounge seating above the water.",
    href: "/lodge",
    link: "See the Lodge",
  },
] as const;

const photoPreview = [
  { order: 11, label: "The great room" },
  { order: 43, label: "The private dock" },
  { order: 17, label: "Kitchen & dining" },
  { order: 26, label: "The bunk room" },
  { order: 40, label: "Firepit by the pond" },
] as const;

function BookingAction({
  enabled,
  className,
  children,
}: {
  enabled: boolean;
  className: string;
  children: ReactNode;
}) {
  return enabled ? (
    <Link className={className} href="/book">{children}</Link>
  ) : (
    <a className={className} href={airbnb} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function HomePage() {
  const directEnabled = directBookingEnabled();
  const hero = lodgePhoto(3);
  const hotTub = lodgePhoto(4);
  const fireside = lodgePhoto(5);
  const waterfront = lodgePhoto(2);

  return (
    <main id="main-content" className="showcase-page">
      <section className="showcase-hero" aria-labelledby="showcase-title">
        <div className="showcase-hero-inner">
          <div className="showcase-hero-copy">
            <p className="showcase-eyebrow showcase-eyebrow-light">
              The Lodge at Kendall Pond · Gardner, Massachusetts
            </p>
            <h1 id="showcase-title">Your own place by the pond.</h1>
            <p className="showcase-hero-lead">
              Spend the day on the deck or by the water, then head inside to the fireplace.
              Just the two of you, or a whole weekend with friends.
            </p>
            <div className="showcase-hero-actions">
              <BookingAction enabled={directEnabled} className="showcase-button showcase-button-light">
                Check your dates <span aria-hidden="true">↗</span>
              </BookingAction>
              <Link className="showcase-quiet-link" href="/photos">
                Explore the photos <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <ul className="showcase-hero-facts" aria-label="Stay at a glance">
            <li>Sleeps 8</li>
            <li>3 bedrooms</li>
            <li>2 bathrooms</li>
            <li>Private waterfront</li>
          </ul>
        </div>
        <div className="showcase-hero-media">
          <figure className="showcase-hero-primary">
            <Image
              alt={hero.alt}
              className="showcase-hero-photo"
              fill
              priority
              sizes="(max-width: 880px) 100vw, 58vw"
              src={hero.src}
            />
            <figcaption>Upper deck · Kendall Pond</figcaption>
          </figure>
          <div className="showcase-hero-secondary">
            <figure className="showcase-hero-detail">
              <Image
                alt={hotTub.alt}
                className="showcase-hero-photo"
                fill
                sizes="(max-width: 880px) 50vw, 29vw"
                src={hotTub.src}
              />
              <figcaption>Hot tub with a view</figcaption>
            </figure>
            <figure className="showcase-hero-detail">
              <Image
                alt={fireside.alt}
                className="showcase-hero-photo"
                fill
                sizes="(max-width: 880px) 50vw, 29vw"
                src={fireside.src}
              />
              <figcaption>Room to settle in</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <div className="showcase-trust">
        <div className="showcase-trust-inner">
          <p><strong>Hosted by Nate &amp; Allie.</strong> We’re happy to answer questions before you book.</p>
          <a href={airbnb + "#reviews"} target="_blank" rel="noopener noreferrer">
            Read guest reviews on Airbnb <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <section className="showcase-intro" aria-labelledby="showcase-intro-title">
        <div className="showcase-intro-main">
          <p className="showcase-eyebrow">The property</p>
          <h2 id="showcase-intro-title">The pond is right outside.</h2>
          <p>
            The upper deck looks out over Kendall Pond, and the lawn leads down
            to the shoreline and dock. Inside, the great room and kitchen give
            everyone a place to cook, eat, and spend time together.
          </p>
        </div>
        <div className="showcase-intro-aside" aria-label="Property highlights">
          <div><strong>8</strong><span>Guests</span></div>
          <div><strong>3</strong><span>Bedrooms</span></div>
          <div><strong>2</strong><span>Full baths</span></div>
          <div><strong>2</strong><span>Fireplaces</span></div>
        </div>
      </section>

      <section className="showcase-moments" aria-labelledby="showcase-moments-title">
        <div className="showcase-section-head">
          <div>
            <p className="showcase-eyebrow">Around the property</p>
            <h2 id="showcase-moments-title">Take a look around.</h2>
          </div>
          <Link className="showcase-inline-link" href="/photos">See all 50 photos <span aria-hidden="true">→</span></Link>
        </div>
        <div className="showcase-moments-grid">
          {moments.map((item) => {
            const photo = lodgePhoto(item.order);
            return (
              <Link className="showcase-moment" href={item.href} key={item.order}>
                <div className="showcase-moment-image">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 620px) 100vw, (max-width: 1050px) 50vw, 25vw"
                  />
                </div>
                <div className="showcase-moment-copy">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                  <span>{item.link} <span aria-hidden="true">↗</span></span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="showcase-water-story" aria-labelledby="showcase-water-title">
        <div className="showcase-water-image">
          <Image
            src={waterfront.src}
            alt={waterfront.alt}
            fill
            sizes="(max-width: 850px) 100vw, 58vw"
          />
        </div>
        <div className="showcase-water-copy">
          <p className="showcase-eyebrow">Waterfront</p>
          <h2 id="showcase-water-title">From the deck to the dock.</h2>
          <p>
            The lawn runs down to the shore, where you’ll find the dock and
            firepit. Sit by the water or take out a kayak when seasonal equipment
            is available. The hot tub is under the covered patio, with the pond
            in view.
          </p>
          <div className="showcase-water-links">
            <Link href="/grounds">See the waterfront <span aria-hidden="true">→</span></Link>
            <Link href="/explore">Around Gardner <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="showcase-photo-section" aria-labelledby="showcase-photo-title">
        <div className="showcase-section-head">
          <div>
            <p className="showcase-eyebrow">Photos</p>
            <h2 id="showcase-photo-title">Inside and out.</h2>
            <p>Browse the rooms, deck, dock, and grounds in photos taken at the Lodge.</p>
          </div>
          <Link className="showcase-inline-link" href="/photos">See all photos <span aria-hidden="true">→</span></Link>
        </div>
        <div className="showcase-photo-mosaic">
          {photoPreview.map((item) => {
            const photo = lodgePhoto(item.order);
            return (
              <Link href="/photos" className="showcase-photo-tile" key={item.order}
                aria-label={"Explore photos: " + item.label}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 620px) 90vw, (max-width: 1000px) 50vw, 34vw"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="showcase-close" aria-labelledby="showcase-close-title">
        <div>
          <p className="showcase-eyebrow">Plan a stay</p>
          <h2 id="showcase-close-title">Have a weekend in mind?</h2>
          <p>
            {directEnabled
              ? "Send us the dates you’re considering. We’ll check availability and send the full price before asking for payment."
              : "Check available dates and prices on our Airbnb listing."}
          </p>
        </div>
        <div className="showcase-close-actions">
          <BookingAction enabled={directEnabled} className="showcase-button showcase-button-dark">
            {directEnabled ? "Check dates" : "Check dates on Airbnb"}
            <span aria-hidden="true">↗</span>
          </BookingAction>
          <Link href="/lodge" className="showcase-inline-link">See the rooms <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  );
}
