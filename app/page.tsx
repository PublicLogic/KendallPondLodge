import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { lodgePhoto } from "@/app/_data/lodge-photos";
import { directBookingEnabled } from "@/lib/booking-db";

export const metadata: Metadata = {
  title: "The Lodge at Kendall Pond | Private Waterfront Stay in Gardner, MA",
  description:
    "Bring the crew to Kendall Pond. A three-bedroom waterfront Lodge in Gardner, MA, with a private dock, hot tub, firepit, and room for eight.",
};

const airbnb =
  process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() ||
  "https://www.airbnb.com/rooms/1667597913565948713";

const moments = [
  {
    order: 42,
    moment: "01 / FIRST STOP",
    title: "Straight to the dock.",
    detail: "Your own stretch of shoreline, a dock, and kayaks when they're in season.",
    href: "/grounds",
    link: "Head to the water",
  },
  {
    order: 4,
    moment: "02 / AFTER HOURS",
    title: "Hot tub o'clock.",
    detail: "Under the covered deck, looking out over the pond. Yes, really.",
    href: "/grounds",
    link: "See the outdoors",
  },
  {
    order: 5,
    moment: "03 / STAY IN",
    title: "Claim your spot.",
    detail: "Big windows, a fireplace, and a great room made for hanging out.",
    href: "/lodge",
    link: "Come inside",
  },
  {
    order: 35,
    moment: "04 / DINNER PLANS",
    title: "Take dinner outside.",
    detail: "A table, a grill, and one very good reason to linger on the deck.",
    href: "/lodge",
    link: "See the Lodge",
  },
] as const;

const photoPreview = [
  { order: 11, label: "The great room" },
  { order: 43, label: "Your dock" },
  { order: 17, label: "Dinner headquarters" },
  { order: 26, label: "The bunk room" },
  { order: 40, label: "Fireside" },
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
  const postcard = lodgePhoto(3);
  const waterfront = lodgePhoto(46);

  return (
    <main id="main-content" className="showcase-page showcase-louder">
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
              The Lodge at Kendall Pond <span aria-hidden="true">/</span> Gardner, Massachusetts
            </p>
            <h1 id="showcase-title">
              <span>Bring the crew.</span>
              <span>We've got the pond.</span>
            </h1>
            <p className="showcase-hero-lead">
              Three bedrooms. Private dock. Hot tub. Firepit. Room for eight
              and absolutely no need to overplan the weekend.
            </p>
            <div className="showcase-hero-actions">
              <BookingAction enabled={directEnabled} className="showcase-button showcase-button-light">
                Find your dates <span aria-hidden="true">↗</span>
              </BookingAction>
              <Link className="showcase-quiet-link" href="/photos">
                Take the photo tour <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <figure className="showcase-hero-postcard">
            <div className="showcase-hero-postcard-image">
              <Image
                src={postcard.src}
                alt={postcard.alt}
                fill
                sizes="(max-width: 950px) 0px, 280px"
              />
            </div>
            <figcaption>
              <small>VIEW FROM THE DECK</small>
              <strong>Yep. It's that close.</strong>
            </figcaption>
          </figure>
          <ul className="showcase-hero-facts" aria-label="Stay at a glance">
            <li>THE WHOLE HOUSE</li>
            <li>SLEEPS 8</li>
            <li>3 BEDROOMS / 2 BATHS</li>
            <li>PRIVATE WATERFRONT</li>
          </ul>
        </div>
      </section>

      <div className="showcase-trust">
        <div className="showcase-trust-inner">
          <p><strong>Hey, we're Nate &amp; Allie.</strong> Got a question about the place? Just ask.</p>
          <a href={airbnb + "#reviews"} target="_blank" rel="noopener noreferrer">
            See what guests say on Airbnb <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <section className="showcase-intro" aria-labelledby="showcase-intro-title">
        <div className="showcase-intro-main">
          <p className="showcase-eyebrow">The good part starts outside</p>
          <h2 id="showcase-intro-title">Drop your bags. Find the water.</h2>
          <p>
            Coffee on the upper deck. An afternoon at the dock. Something on the
            grill and everybody around the table. Or do none of that and take
            the whole day slow. You've got the space.
          </p>
          <Link className="showcase-inline-link showcase-intro-link" href="/lodge">
            Get to know the house <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="showcase-intro-aside" aria-label="Property highlights">
          <div><strong>08</strong><span>Room for eight</span></div>
          <div><strong>03</strong><span>Bedrooms</span></div>
          <div><strong>02</strong><span>Full baths</span></div>
          <div><strong>02</strong><span>Fireplaces</span></div>
        </div>
      </section>

      <section className="showcase-moments" aria-labelledby="showcase-moments-title">
        <div className="showcase-section-head">
          <div>
            <p className="showcase-eyebrow">Pick your favorite part</p>
            <h2 id="showcase-moments-title">Good reasons to stay put.</h2>
          </div>
          <Link className="showcase-inline-link" href="/photos">
            All 50 photos <span aria-hidden="true">→</span>
          </Link>
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
                    sizes="(max-width: 620px) 100vw, (max-width: 1050px) 50vw, 60vw"
                  />
                </div>
                <div className="showcase-moment-copy">
                  <span className="showcase-moment-index">{item.moment}</span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                  <span className="showcase-moment-link">{item.link} <span aria-hidden="true">↗</span></span>
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
          <div className="showcase-water-image-caption" aria-hidden="true">THE SHORELINE / KENDALL POND</div>
        </div>
        <div className="showcase-water-copy">
          <p className="showcase-eyebrow">No need to load up the car</p>
          <h2 id="showcase-water-title">Just follow the lawn.</h2>
          <p>
            Out past the patio, across the grass, and there's the pond. Pull up
            a chair by the firepit, head for the dock, or stay up on the deck and
            watch the water. The hot tub's tucked under the covered patio for later.
          </p>
          <div className="showcase-water-links">
            <Link href="/grounds">Go waterfront <span aria-hidden="true">→</span></Link>
            <Link href="/explore">Go explore <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="showcase-photo-section" aria-labelledby="showcase-photo-title">
        <div className="showcase-section-head">
          <div>
            <p className="showcase-eyebrow">You've seen the view</p>
            <h2 id="showcase-photo-title">Go on. Be nosy.</h2>
            <p>From the bunk room to the firepit: the place, in pictures.</p>
          </div>
          <Link className="showcase-inline-link" href="/photos">
            The full gallery <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="showcase-photo-mosaic">
          {photoPreview.map((item) => {
            const photo = lodgePhoto(item.order);
            return (
              <Link
                href="/photos"
                className="showcase-photo-tile"
                key={item.order}
                aria-label={"See more photos: " + item.label}
              >
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
          <p className="showcase-eyebrow">One more thing</p>
          <h2 id="showcase-close-title">So, when are you coming?</h2>
          <p>
            {directEnabled
              ? "Send us the dates you've got in mind. We'll check availability and send the full price before asking for payment. No surprises at checkout."
              : "See available nights and prices on our Airbnb listing."}
          </p>
        </div>
        <div className="showcase-close-actions">
          <BookingAction enabled={directEnabled} className="showcase-button showcase-button-dark">
            {directEnabled ? "Find your dates" : "See dates on Airbnb"}
            <span aria-hidden="true">↗</span>
          </BookingAction>
          <Link href="/photos" className="showcase-inline-link">
            Not yet? Keep looking <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
