import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const hero = lodgePhoto(1);
  const deck = lodgePhoto(3);
  return (
    <main id="main-content" className="showcase-page guest-ready-home">
      <section className="showcase-hero" aria-labelledby="showcase-title">
        <Image src={hero.src} alt={hero.alt} className="showcase-hero-image" fill priority sizes="100vw" />
        <div className="showcase-hero-overlay" aria-hidden="true" />
        <div className="showcase-hero-inner">
          <div className="showcase-hero-copy">
            <p className="showcase-eyebrow showcase-eyebrow-light">The Lodge at Kendall Pond · Gardner, Massachusetts</p>
            <h1 id="showcase-title">Bring the crew.<br /><em>We’ve got the pond.</em></h1>
            <p className="showcase-hero-lead">A whole house on the water, a hot tub under the deck, and enough room to make a weekend of it.</p>
            <div className="showcase-hero-actions">
              <BookingAction enabled={enabled} className="showcase-button showcase-button-light">{enabled ? "Check dates" : "Check dates on Airbnb"}<span aria-hidden="true">↗</span></BookingAction>
              <Link className="showcase-quiet-link" href="/photos">Take the photo tour <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <ul className="showcase-hero-facts" aria-label="Stay at a glance">
            <li>Entire house</li><li>Up to 8 guests</li><li>3 bedrooms · 2 baths</li><li>Private waterfront</li>
          </ul>
        </div>
      </section>
      <GuestReviewEvidence />
      <section className="showcase-moments guest-spaces" aria-labelledby="spaces-title">
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
