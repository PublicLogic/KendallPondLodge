import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { lodgePhoto } from "@/app/_data/lodge-photos";
import { directBookingEnabled } from "@/lib/booking-db";
import { ExploreDirectory } from "./ExploreDirectory";
import { WachusettRail } from "./WachusettRail";
import { CommunityEvents } from "./CommunityEvents";
import { loadPjExplore } from "./pjExplore";
import { explorePicks, localResourceLinks } from "./guide-data";
import styles from "./explore.module.css";

export const metadata: Metadata = {
  title: { absolute: "Things to Do in Gardner & Wachusett | The Lodge at Kendall Pond" },
  alternates: { canonical: "/explore" },
  description:
    "Local restaurants, Wachusett Mountain trails, Red Apple Farm, museums, and Gardner events near the Lodge at Kendall Pond. Plus MBTA train details for Boston trips.",
};

const pondPhoto = lodgePhoto(49);
const deckPhoto = lodgePhoto(35);

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const feed = await loadPjExplore();
  const bookingHref = directBookingEnabled() ? "/book" : "/rates";

  return (
    <main id="main-content" className={styles.page} data-curated-explore>
      <section className={styles.opening} aria-labelledby="explore-title">
        <div className={styles.openingCopy}>
          <p className={styles.eyebrow}>Your guide to Gardner &amp; Wachusett</p>
          <h1 id="explore-title">Get out and see a little.</h1>
          <p className={styles.openingIntro}>
            A diner downtown. Trails on Wachusett. Cider doughnuts in Phillipston. Here's what we'd tell a friend to check out.
          </p>
          <nav className={styles.openingNav} aria-label="Explore this guide">
            <a href="#days">Make a day of it</a>
            <a href="#local-picks">Our picks</a>
            <a href="#train">Train</a>
            <a href="#city-events">Events</a>
            <a href="#around-town">Chamber</a>
          </nav>
        </div>
        <figure className={styles.openingPhoto}>
          <Image src={pondPhoto.src} alt={pondPhoto.alt} fill priority
            sizes="(max-width: 840px) 100vw, 46vw" />
          <figcaption>The Lodge waterfront in autumn.</figcaption>
        </figure>
      </section>

      <section className={styles.days} id="days" aria-labelledby="days-title">
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Out for the day</p>
            <h2 id="days-title">Make a day of it.</h2>
          </div>
          <p>Start with one stop or make all three. Just check hours before you go.</p>
        </header>
        <div className={styles.dayGrid}>
          <article className={styles.day}>
            <p className={styles.dayArea}>Gardner</p>
            <h3>Gardner, start to finish</h3>
            <ol>
              <li><span>Morning</span><p>Pull in for breakfast at <a href="https://business.gardnerma.com/list/member/blue-moon-diner-1363" target="_blank" rel="noopener noreferrer">Blue Moon Diner ↗</a>.</p></li>
              <li><span>Midday</span><p>Stop by <a href="https://www.gardnermuseuminc.com/home/hours" target="_blank" rel="noopener noreferrer">the Gardner Museum ↗</a> if it&apos;s open.</p></li>
              <li><span>Evening</span><p>Grab dinner at <a href="https://www.moonhillbrewing.com/" target="_blank" rel="noopener noreferrer">Gardner Ale House ↗</a> downtown.</p></li>
            </ol>
          </article>
          <article className={styles.day}>
            <p className={styles.dayArea}>Wachusett &amp; Phillipston</p>
            <h3>Wachusett &amp; Red Apple Farm</h3>
            <ol>
              <li><span>Morning</span><p>Pick a trail at <a href="https://www.mass.gov/locations/wachusett-mountain-state-reservation" target="_blank" rel="noopener noreferrer">Wachusett Mountain ↗</a>.</p></li>
              <li><span>Afternoon</span><p>Stop at <a href="https://www.redapplefarm.com/" target="_blank" rel="noopener noreferrer">Red Apple Farm ↗</a> for cider donuts or seasonal farm activities.</p></li>
              <li><span>Evening</span><p>Back to the Lodge to make dinner.</p></li>
            </ol>
          </article>
          <article className={styles.day}>
            <p className={styles.dayArea}>Fitchburg &amp; Gardner</p>
            <h3>When it rains</h3>
            <ol>
              <li><span>First stop</span><p>Head inside the <a href="https://fitchburgartmuseum.org/visit/" target="_blank" rel="noopener noreferrer">Fitchburg Art Museum ↗</a>.</p></li>
              <li><span>Later</span><p>See what's playing at <a href="https://gardnercinemas.com/" target="_blank" rel="noopener noreferrer">Gardner Cinemas ↗</a> for a film.</p></li>
              <li><span>Dinner</span><p>Bring home takeout from <a href="https://www.sawaasiancuisine.com/" target="_blank" rel="noopener noreferrer">Sawa ↗</a> and stay in.</p></li>
            </ol>
          </article>
        </div>
        <p className={styles.planNote}>
          Hours and trail access change. Check the linked sites before heading out.
        </p>
      </section>

      <section className={styles.picks} id="local-picks" aria-labelledby="picks-title">
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Our favorites around here</p>
            <h2 id="picks-title">Where we'd send you.</h2>
          </div>
          <p>From breakfast in Gardner to the top of Wachusett. Pick what sounds good, and we'll point you there.</p>
        </header>
        <ExploreDirectory />
      </section>

      <WachusettRail transit={feed?.transit ?? null} />
      <CommunityEvents feed={feed} />

      <section id="around-town" className={styles.chamber} aria-labelledby="chamber-title">
        <div className={styles.chamberInner}>
          <div className={styles.chamberIntro}>
            <p className={styles.eyebrow}>Greater Gardner Chamber</p>
            <h2 id="chamber-title">The Chamber's got more.</h2>
            <p>
              We haven't listed every restaurant, shop, or event. The Greater
              Gardner Chamber keeps a business directory and a calendar.
              Start there if you want to keep looking.
            </p>
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
            <p className={styles.chamberNote}>Hours and event details come from the Chamber and individual businesses. Check before heading out.</p>
          </div>
        </div>
      </section>

      <section className={styles.back} aria-labelledby="back-title">
        <div className={styles.backPhoto}>
          <Image src={deckPhoto.src} alt={deckPhoto.alt} fill sizes="(max-width: 840px) 100vw, 47vw" />
        </div>
        <div className={styles.backCopy}>
          <p className={styles.eyebrow}>When you're ready to come back</p>
          <h2 id="back-title">Then back to the pond.</h2>
          <p>
            Spend an hour out or stay gone all day. The deck, the kitchen, and
            a little time by the water will be here when you get back.
          </p>
          <div className={styles.backLinks}>
            <Link href={bookingHref}>Check your dates <span aria-hidden="true">↗</span></Link>
            <Link href="/lodge">See the house <span aria-hidden="true">→</span></Link>
            <Link href="/area">Getting here <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
