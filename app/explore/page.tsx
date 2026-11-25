import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { lodgePhoto } from "@/app/_data/lodge-photos";
import { directBookingEnabled } from "@/lib/booking-db";
import { ExploreDirectory } from "./ExploreDirectory";
import { WachusettRail } from "./WachusettRail";
import { CommunityEvents } from "./CommunityEvents";
import { loadPjExplore } from "./pjExplore";
import { localResourceLinks } from "./guide-data";
import styles from "./explore.module.css";

export const metadata: Metadata = {
  title: { absolute: "Things to Do in Gardner & Wachusett | The Lodge at Kendall Pond" },
  alternates: { canonical: "/explore" },
  description:
    "Our local notes from the Lodge at Kendall Pond: where to eat in Gardner, Wachusett trails, Red Apple Farm, museums, train connections and events.",
};

const pondPhoto = lodgePhoto(49);
const deckPhoto = lodgePhoto(35);

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const feed = await loadPjExplore();
  const bookingHref = directBookingEnabled() ? "/book" : "/rates";

  const rainyDay = feed?.places.find(place => place.category === "rain");

  return (
    <main id="main-content" className={styles.page} data-curated-explore>
      <section className={styles.opening} aria-labelledby="explore-title">
        <div className={styles.openingCopy}>
          <p className={styles.eyebrow}>Gardner &amp; the Wachusett area</p>
          <h1 id="explore-title">Worth leaving the dock for.</h1>
          <p className={styles.openingIntro}>
            The cheese is made in Winchendon. The chocolates come from Main Street in Gardner. On Parker Street, there’s a brewery worth making dinner plans around. These are a few of the places we’d like you to know during your stay.
          </p>
          <nav className={styles.openingNav} aria-label="Explore this guide">
            <a href="#local-picks">Map &amp; places</a>
            <a href="#weekend-plans">Local makers</a>
            <a href="#gatherings">Plan a gathering</a>
            <a href="#train">Train</a>
            <a href="#city-events">Events</a>
          </nav>
        </div>
        <figure className={styles.openingPhoto}>
          <Image src={pondPhoto.src} alt={pondPhoto.alt} fill priority
            sizes="(max-width: 840px) 100vw, 46vw" />
          <figcaption>The Lodge waterfront in autumn.</figcaption>
        </figure>
      </section>

      <section className={styles.picks} id="local-picks" aria-labelledby="picks-title">
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Gardner and North Central Massachusetts</p>
            <h2 id="picks-title">Local favorites.</h2>
          </div>
        </header>
        <ExploreDirectory places={feed?.places ?? []} />
      </section>

      <section className={styles.picks} aria-labelledby="weekend-plans">
        <h2 id="weekend-plans">Made here</h2>
        <h3 id="farm-shop-supper">Smith’s Country Cheese, Winchendon</h3>
        <p>The shop at Smith’s has a window into the cheesemaking room. If you catch the crew at work, you can see how the cheese on the counter is made. It’s a stop we recommend to anyone interested in the farms of North Central Massachusetts.</p>
        <a href="https://smithscountrycheese.com/visit-the-farm/">Visit the farm and country shop</a>
        <h3>Priscilla Candy Shop, Gardner</h3>
        <p>Charlie Stephano founded Priscilla Candy Shop in Gardner in 1936. His French Roll is still on the counter at 4 Main Street. It has a soft chocolate center dipped in milk chocolate and rolled in roasted cashews. If you’re bringing a gift to someone in town, this is where we’d start.</p>
        <a href="https://www.priscillacandy.com/">Explore Priscilla’s chocolates</a>
        {rainyDay && (
          <p>Also on the local arts and indoor guide: <a href={rainyDay.url}>{rainyDay.name}</a>.</p>
        )}
        <Link href={bookingHref}>{bookingHref === "/book" ? "Check lodge availability for your weekend" : "See lodge rates"}</Link>
      </section>

      <WachusettRail transit={feed?.transit ?? null} />
      <CommunityEvents feed={feed} />

      <section id="around-town" className={styles.chamber} aria-labelledby="chamber-title">
        <div className={styles.chamberInner}>
          <div className={styles.chamberIntro}>
            <p className={styles.eyebrow}>Greater Gardner Chamber</p>
            <h2 id="chamber-title">There&apos;s more around here.</h2>
           </div>
          <div className={styles.chamberLinks}>
            <a href={localResourceLinks.chamberEvents} target="_blank" rel="noopener noreferrer">
              <span><small>What's on</small><strong>Community &amp; Chamber events</strong></span><span aria-hidden="true">↗</span>
            </a>
            <a href={localResourceLinks.chamberRestaurants} target="_blank" rel="noopener noreferrer">
              <span><small>Where to eat</small><strong>Local restaurants &amp; cafés</strong></span><span aria-hidden="true">↗</span>
            </a>
            <a href={localResourceLinks.chamberDirectory} target="_blank" rel="noopener noreferrer">
              <span><small>Around town</small><strong>Greater Gardner business directory</strong></span><span aria-hidden="true">↗</span>
            </a>
            <p className={styles.chamberNote}>These are Chamber listings. Check with the business or organizer for current details.</p>
          </div>
        </div>
      </section>

      <section id="gatherings" className={styles.back} aria-labelledby="back-title">
        <div className={styles.backPhoto}>
          <Image src={deckPhoto.src} alt={deckPhoto.alt} fill sizes="(max-width: 840px) 100vw, 47vw" />
        </div>
        <div className={styles.backCopy}>
          <p className={styles.eyebrow}>Gatherings in North Central Massachusetts</p>
          <h2 id="back-title">Bring your people to Gardner.</h2>
          <p>If you’re coming for a birthday, reunion, wedding weekend or team retreat, we can help with the pieces you need. Stay at <Link href="/lodge">the lodge</Link> and ask us for an introduction to a local restaurant, business or function hall for the gathering itself.</p>
          <p>One place we’d show you is the <a href="https://www.gardnerpacc.com/">Gardner PACC</a>, right on Kendall Pond. Its banquet hall hosts receptions and reunions, and its pavilion is an option for a seasonal outing.</p>
          <p>For a larger event, we can also work with you through PublicLogic on venue outreach, a schedule and day-of coordination. Send us your dates, approximate headcount and what you have in mind. We’ll help you figure out whom to call first.</p>
          <div className={styles.backLinks}>
            <a href="mailto:info@publiclogic.org?subject=Kendall%20Pond%20event%20inquiry">Ask Nate &amp; Allie about your gathering →</a>
            <a href="https://www.visitnorthcentral.com/meetings-events/">Browse the regional venue guide ↗</a>
            <Link href={bookingHref}>Check your dates →</Link>
            <Link href="/area">Getting to Gardner →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
