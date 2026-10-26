import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { lodgePhoto } from "@/app/_data/lodge-photos";
import { directBookingEnabled } from "@/lib/booking-db";

export const metadata: Metadata = {
  title: "The Lodge at Kendall Pond | Private Waterfront Stay in Gardner, MA",
  description:
    "A whole lake house on Kendall Pond in Gardner, MA. Three bedrooms, two baths, hot tub, private dock, firepit and space for eight. Explore real photos and request your dates.",
};

const airbnb =
  process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() ||
  "https://www.airbnb.com/rooms/1667597913565948713";

const moments = [
  {
    order: 42,
    title: "Mornings by the water",
    detail: "Private shoreline, dock and room to slow down.",
    href: "/grounds",
    link: "Explore the waterfront",
  },
  {
    order: 4,
    title: "An evening in the hot tub",
    detail: "A pond view from the covered patio.",
    href: "/grounds",
    link: "See the outdoor spaces",
  },
  {
    order: 5,
    title: "Everyone under one roof",
    detail: "A generous great room for staying in.",
    href: "/lodge",
    link: "Step inside",
  },
  {
    order: 35,
    title: "Dinner on the deck",
    detail: "Fresh air and the pond just beyond the table.",
    href: "/lodge",
    link: "See the Lodge",
  },
] as const;

const photoPreview = [
  { order: 11, label: "The great room" },
  { order: 43, label: "Your own dock" },
  { order: 17, label: "Kitchen & dining" },
  { order: 26, label: "Room for the family" },
  { order: 40, label: "Firepit evenings" },
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
  const hero = lodgePhoto(1);
  const waterfront = lodgePhoto(2);

  return (
    <main id="main-content" className="showcase-page">
      <section className="showcase-hero" aria-labelledby="showcase-title">
        <Image
          alt={hero.alt}
          className="showcase-hero-image"
          fill
          priority
          sizes="100vw"
          src={hero.src}
        />
        <div className="showcase-hero-overlay" aria-hidden="true" />
        <div className="showcase-hero-inner">
          <div className="showcase-hero-copy">
            <p className="showcase-eyebrow showcase-eyebrow-light">
              Private waterfront · Gardner, Massachusetts
            </p>
            <h1 id="showcase-title">The Lodge at Kendall Pond</h1>
            <p className="showcase-hero-lead">
              A whole place by the water, with nowhere else you need to be.
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
      </section>

      <div className="showcase-trust">
        <div className="showcase-trust-inner">
          <p><strong>Hosted by Nate &amp; Allie.</strong> A real place to make memories together.</p>
          <a href={airbnb + "#reviews"} target="_blank" rel="noopener noreferrer">
            Read guest reviews on Airbnb <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <section className="showcase-intro" aria-labelledby="showcase-intro-title">
        <div className="showcase-intro-main">
          <p className="showcase-eyebrow">Your corner of Kendall Pond</p>
          <h2 id="showcase-intro-title">Come for the water. Stay for the time together.</h2>
          <p>
            Coffee out on the deck. A paddle on the pond. A long dinner, a fire,
            and a night that doesn’t need a plan. The Lodge gives your whole group
            a place to settle in and feel at home.
          </p>
        </div>
        <div className="showcase-intro-aside" aria-label="Property highlights">
          <div><strong>8</strong><span>Guests</span></div>
          <div><strong>3</strong><span>Bedrooms</span></div>
          <div><strong>2</strong><span>Full baths</span></div>
          <div><strong>1</strong><span>Pond-side getaway</span></div>
        </div>
      </section>

      <section className="showcase-moments" aria-labelledby="showcase-moments-title">
        <div className="showcase-section-head">
          <div>
            <p className="showcase-eyebrow">The best parts of staying here</p>
            <h2 id="showcase-moments-title">Make the weekend yours.</h2>
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
          <p className="showcase-eyebrow">Right outside the door</p>
          <h2 id="showcase-water-title">The pond is the point.</h2>
          <p>
            Walk down to the shoreline and find your spot. Spend the afternoon
            out on the water, then come back for the hot tub or a fire by the pond.
            You’re close to Gardner and Wachusett, but you might not want to leave.
          </p>
          <div className="showcase-water-links">
            <Link href="/grounds">Explore the waterfront <span aria-hidden="true">→</span></Link>
            <Link href="/explore">Around Gardner <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="showcase-photo-section" aria-labelledby="showcase-photo-title">
        <div className="showcase-section-head">
          <div>
            <p className="showcase-eyebrow">A closer look</p>
            <h2 id="showcase-photo-title">See yourself here.</h2>
            <p>Not stock photos. The rooms, outdoor spaces, and shoreline you’ll actually visit.</p>
          </div>
          <Link className="showcase-inline-link" href="/photos">Open the complete gallery <span aria-hidden="true">→</span></Link>
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
          <p className="showcase-eyebrow">A stay worth making time for</p>
          <h2 id="showcase-close-title">Your dates. Your people. The pond.</h2>
          <p>
            {directEnabled
              ? "Choose your dates and send us a request. We’ll check availability and share the full price before any payment."
              : "Explore available dates and reservation options on our Airbnb listing."}
          </p>
        </div>
        <div className="showcase-close-actions">
          <BookingAction enabled={directEnabled} className="showcase-button showcase-button-dark">
            {directEnabled ? "Check dates & request a stay" : "Check dates on Airbnb"}
            <span aria-hidden="true">↗</span>
          </BookingAction>
          <Link href="/lodge" className="showcase-inline-link">Take a look inside <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  );
}
