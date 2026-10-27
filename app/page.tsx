import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { RetreatHero } from "@/app/_components/RetreatHero";
import { lodgePhoto } from "@/app/_data/lodge-photos";
import { BookingSteps, GuestReviewEvidence, SleepPlanLink, StayFAQ } from "@/app/_components/StayInformation";
import { directBookingEnabled, hostContactHref } from "@/lib/booking-db";

export const metadata: Metadata = {
  title: "The Lodge at Kendall Pond | Private Waterfront Stay in Gardner, MA",
  description: "A whole waterfront house in Gardner, Massachusetts. Three bedrooms, room for eight, a private dock, hot tub and firepit. Hosted by Nate and Allie.",
  alternates: { canonical: "/" },
};
const airbnb = process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() || "https://www.airbnb.com/rooms/1667597913565948713";
const spaces = [
  { photo: 42, title: "Your spot on the water.", copy: "The lawn runs down to the private shoreline and dock. Bring your coffee; the view is already here.", href: "/grounds", link: "See the waterfront" },
  { photo: 4, title: "The hot tub has a view, too.", copy: "Tucked under the upper deck, with the pond just beyond the patio.", href: "/grounds", link: "Around the grounds" },
  { photo: 5, title: "A good place to stay in.", copy: "A fireplace, tall windows, and a kitchen close enough to keep the cook in the conversation.", href: "/lodge", link: "Inside the Lodge" },
];
function BookingAction({ enabled, className, children }: { enabled: boolean; className: string; children: ReactNode }) {
  return enabled ? <Link className={className} href="/book">{children}</Link> :
    <a className={className} href={airbnb} target="_blank" rel="noopener noreferrer">{children}</a>;
}
export default function HomePage() {
  const enabled = directBookingEnabled();
  const heroScenes = [
    { photo: 46, label: "By the water", position: "center 55%" },
    { photo: 4, label: "In the hot tub", position: "center 55%" },
    { photo: 3, label: "On the deck", position: "center 52%" },
  ].map(({ photo, label, position }) => {
    const { src, alt } = lodgePhoto(photo);
    return { src, alt, label, position };
  }) as [
    { src: string; alt: string; label: string; position: string },
    { src: string; alt: string; label: string; position: string },
    { src: string; alt: string; label: string; position: string },
  ];
  const deck = lodgePhoto(3);
  return (
    <main id="main-content" className="showcase-page guest-ready-home">
      <RetreatHero directEnabled={enabled} airbnbHref={airbnb} scenes={heroScenes} />
      <GuestReviewEvidence />
      <section className="showcase-moments guest-spaces" aria-labelledby="spaces-title">
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
          <div><p className="showcase-eyebrow">At the house</p><h2 id="spaces-title">A few good places to land.</h2></div>
          <Link className="showcase-inline-link" href="/photos">See all 50 photos <span aria-hidden="true">→</span></Link>
        </div>
        <div className="guest-spaces-grid">
          {spaces.map((space) => {
            const photo = lodgePhoto(space.photo);
            return <Link className="showcase-moment" key={space.photo} href={space.href}>
              <div className="showcase-moment-image"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 100vw, 33vw" /></div>
              <div className="showcase-moment-copy"><h3>{space.title}</h3><p>{space.copy}</p><span>{space.link} <span aria-hidden="true">→</span></span></div>
            </Link>;
          })}
        </div>
      </section>
      <section className="guest-house-story" aria-labelledby="house-story-title">
        <div className="guest-house-photo"><Image src={deck.src} alt={deck.alt} fill sizes="(max-width: 800px) 100vw, 55vw" /></div>
        <div className="guest-house-copy">
          <p className="showcase-eyebrow">Everyone has a place</p><h2 id="house-story-title">Dinner together.<br />Room to turn in.</h2>
          <p>A king room, a queen room, a twin-over-full bunk, and a queen sleeper sofa. Three bedrooms, two full baths, and a maximum of eight overnight guests.</p>
          <SleepPlanLink />
          <p className="guest-host-note"><strong>Hosted by Nate &amp; Allie.</strong> We own the Lodge and live locally. Ask us about your sleeping setup, the season’s outdoor gear, or anything else that matters for your stay.</p>
          <a className="showcase-inline-link" href={hostContactHref()}>Ask us a question <span aria-hidden="true">↗</span></a>
        </div>
      </section>
      {enabled && <BookingSteps />}
      <StayFAQ contactHref={hostContactHref()} />
      <section className="showcase-close" aria-labelledby="showcase-close-title">
        <div><p className="showcase-eyebrow">See you at the pond</p><h2 id="showcase-close-title">Got a weekend in mind?</h2>
          <p>{enabled ? "Send us your dates. We’ll check availability and send the full price before asking for payment." : "Find available nights and the full price on Airbnb."}</p></div>
        <div className="showcase-close-actions"><BookingAction enabled={enabled} className="showcase-button showcase-button-dark">{enabled ? "Request your dates" : "View dates on Airbnb"}<span aria-hidden="true">↗</span></BookingAction>
          <Link className="showcase-inline-link" href="/explore">Around Gardner &amp; Wachusett <span aria-hidden="true">→</span></Link></div>
      </section>
    </main>
  );
}
