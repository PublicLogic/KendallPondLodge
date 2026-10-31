import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { RetreatHero } from "@/app/_components/RetreatHero";
import { PondScenery } from "@/app/_components/PondScenery";
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
  { photo: 25, title: "The bedrooms", copy: "A king, a queen, a bunk room, and a sleeper sofa. Room for eight overnight guests.", href: "/lodge#sleeping", link: "See the bedrooms" },
  { photo: 6, title: "Out to the water", copy: "Walk across the lawn to the firepit, private shoreline, and dock.", href: "/grounds", link: "Around the grounds" },
  { photo: 17, title: "The kitchen & dining room", copy: "A full kitchen, breakfast bar, and a place for everyone to eat together.", href: "/lodge#living", link: "See the kitchen" },
];
function BookingAction({ enabled, className, children }: { enabled: boolean; className: string; children: ReactNode }) {
  return enabled ? <Link className={className} href="/book">{children}</Link> :
    <a className={className} href={airbnb} target="_blank" rel="noopener noreferrer">{children}</a>;
}
export default function HomePage() {
  const enabled = directBookingEnabled();
  const heroScenes = [
    { ...lodgePhoto(46), label: "Kendall Pond", position: "center 56%" },
    { ...lodgePhoto(4), label: "In the hot tub", position: "center 55%" },
    { ...lodgePhoto(35), label: "On the deck", position: "center 52%" },
  ] as const;
  const house = lodgePhoto(7);
  return (
    <main id="main-content" className="showcase-page guest-ready-home">
      <RetreatHero directEnabled={enabled} airbnbHref={airbnb} scenes={heroScenes} />
      <GuestReviewEvidence />
      <section className="showcase-moments guest-spaces" aria-labelledby="spaces-title">
        <div className="showcase-section-head">
          <div><p className="showcase-eyebrow">A look at the place</p><h2 id="spaces-title">Take a look around.</h2></div>
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
          <p className="showcase-eyebrow">The whole place</p><h2 id="house-story-title">From the kitchen to the shoreline.</h2>
          <p>There's room to be together without doing everything together: two living areas, a full kitchen, the upper deck, and the waterfront just beyond the lawn.</p>
          <Link className="showcase-inline-link" href="/lodge">See inside the Lodge <span aria-hidden="true">→</span></Link>
          <p className="guest-host-note"><strong>Hosted by Nate &amp; Allie.</strong> We own the Lodge and live nearby. If you want to know which bedroom works best for your group or what's available on the water during your dates, just ask.</p>
          <a className="showcase-inline-link" href={hostContactHref()}>Ask us a question <span aria-hidden="true">↗</span></a>
        </div>
      </section>
      {enabled && <BookingSteps />}
      <StayFAQ contactHref={hostContactHref()} />
      <section className="showcase-close kpl-pond-ambient" aria-labelledby="showcase-close-title">
        <PondScenery scene="home" />
        <div><p className="showcase-eyebrow">Hosted by Nate &amp; Allie</p><h2 id="showcase-close-title">We'd love to host you.</h2>
          <p>{enabled ? "Check your dates and review the full price and terms before you pay." : "Find available nights and the full price on Airbnb."}</p></div>
        <div className="showcase-close-actions"><BookingAction enabled={enabled} className="showcase-button showcase-button-dark">{enabled ? "Check dates & price" : "View dates on Airbnb"}<span aria-hidden="true">↗</span></BookingAction>
          <Link className="showcase-inline-link" href="/explore">Around Gardner &amp; Wachusett <span aria-hidden="true">→</span></Link></div>
      </section>
    </main>
  );
}
