import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { RetreatHero } from "@/app/_components/RetreatHero";
import { lodgePhoto } from "@/app/_data/lodge-photos";
import { BookingSteps, GuestReviewEvidence, StayFAQ } from "@/app/_components/StayInformation";
import { directBookingEnabled, hostContactHref } from "@/lib/booking-db";

export const metadata: Metadata = {
  title: "The Lodge at Kendall Pond | Private Waterfront Stay in Gardner, MA",
  description: "A whole waterfront house in Gardner, Massachusetts. Three bedrooms, room for eight, a private dock, hot tub and firepit. Hosted by Nate and Allie.",
  alternates: { canonical: "/" },
};
const airbnb = process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() || "https://www.airbnb.com/rooms/1667597913565948713";
const spaces = [
  { photo: 25, title: "Sleep well.", copy: "Three bedrooms, two full baths, and room for up to eight overnight guests.", href: "/lodge#sleeping", link: "See the bedrooms" },
  { photo: 6, title: "Step outside.", copy: "The lawn opens toward the firepit, shoreline, and dock, with room to spread out between them.", href: "/grounds", link: "Around the grounds" },
  { photo: 5, title: "Stay together.", copy: "The great room, kitchen, and dining area keep the main level connected.", href: "/lodge", link: "Inside the Lodge" },
];
function BookingAction({ enabled, className, children }: { enabled: boolean; className: string; children: ReactNode }) {
  return enabled ? <Link className={className} href="/book">{children}</Link> :
    <a className={className} href={airbnb} target="_blank" rel="noopener noreferrer">{children}</a>;
}
export default function HomePage() {
  const enabled = directBookingEnabled();
  const heroScenes = [
    {
      src: "/images/kpl/2026-10-28/kendall-pond-lodge-dawn-mist.webp",
      alt: "Morning mist above still water and reflected trees on Kendall Pond",
      label: "By the water",
      position: "center 45%",
    },
    { ...lodgePhoto(4), label: "In the hot tub", position: "center 55%" },
    {
      src: "/images/kpl/2026-10-28/kendall-pond-lodge-deck-lounge-autumn.webp",
      alt: "Cushioned deck seating overlooking autumn trees and mist on Kendall Pond",
      label: "On the deck",
      position: "center 52%",
    },
  ] as const;
  const house = {
    src: "/images/kpl/2026-10-28/kendall-pond-lodge-exterior-autumn.webp",
    alt: "The yellow Lodge, brown deck, and covered hot tub framed by autumn trees",
  };
  return (
    <main id="main-content" className="showcase-page guest-ready-home">
      <RetreatHero directEnabled={enabled} airbnbHref={airbnb} scenes={heroScenes} />
      <GuestReviewEvidence />
      <section className="showcase-moments guest-spaces" aria-labelledby="spaces-title">
        <div className="showcase-section-head">
          <div><p className="showcase-eyebrow">The stay</p><h2 id="spaces-title">The house. The yard. The pond.</h2></div>
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
        <div className="guest-house-photo"><Image src={house.src} alt={house.alt} fill sizes="(max-width: 800px) 100vw, 55vw" /></div>
        <div className="guest-house-copy">
          <p className="showcase-eyebrow">The whole place</p><h2 id="house-story-title">A whole house, right on the water.</h2>
          <p>Three bedrooms, two full baths, a kitchen, fireplaces, an upper deck, covered patio, hot tub, lawn, and private waterfront. Up to eight overnight guests.</p>
          <Link className="showcase-inline-link" href="/lodge">See inside the Lodge <span aria-hidden="true">→</span></Link>
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
