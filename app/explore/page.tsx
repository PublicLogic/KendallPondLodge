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
    "A local guide from the Lodge at Kendall Pond: Gardner restaurants and coffee, Wachusett hiking and skiing, museums, Red Apple Farm, chamber events, and train connections to Boston.",
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
          <p className={styles.eyebrow}>Gardner &amp; Wachusett · Local guide</p>
          <h1 id="explore-title">Get out and see a little.</h1>
          <p className={styles.openingIntro}>
            Good food, a mountain worth climbing, and a few places we keep coming back to. Here’s where we’d send you.
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
            <p className={styles.eyebrow}>A few outing ideas</p>
            <h2 id="days-title">Ideas for a day out.</h2>
          </div>
          <p>We&apos;ve grouped places that fit together. Check each venue&apos;s hours before going.</p>
        </header>
        <div className={styles.dayGrid}>
          <article className={styles.day}>
            <p className={styles.dayArea}>Gardner</p>
            <h3>Breakfast, history &amp; dinner</h3>
            <ol>
              <li><span>Morning</span><p>Breakfast at <a href="https://business.gardnerma.com/list/member/blue-moon-diner-1363" target="_blank" rel="noopener noreferrer">Blue Moon Diner ↗</a>.</p></li>
              <li><span>Midday</span><p>Visit <a href="https://www.gardnermuseuminc.com/home/hours" target="_blank" rel="noopener noreferrer">the Gardner Museum ↗</a> if it&apos;s open.</p></li>
              <li><span>Evening</span><p>Dinner at <a href="https://www.moonhillbrewing.com/" target="_blank" rel="noopener noreferrer">Gardner Ale House ↗</a> downtown.</p></li>
            </ol>
          </article>
          <article className={styles.day}>
            <p className={styles.dayArea}>Wachusett &amp; Phillipston</p>
            <h3>Wachusett &amp; Red Apple Farm</h3>
            <ol>
              <li><span>Morning</span><p>Choose a trail at <a href="https://www.mass.gov/locations/wachusett-mountain-state-reservation" target="_blank" rel="noopener noreferrer">Wachusett Mountain ↗</a>.</p></li>
              <li><span>Afternoon</span><p>Stop at <a href="https://www.redapplefarm.com/" target="_blank" rel="noopener noreferrer">Red Apple Farm ↗</a> for cider donuts or seasonal farm activities.</p></li>
              <li><span>Evening</span><p>Head back to the Lodge for dinner.</p></li>
            </ol>
          </article>
          <article className={styles.day}>
            <p className={styles.dayArea}>Fitchburg &amp; Gardner</p>
            <h3>Rainy-day stops</h3>
            <ol>
              <li><span>First stop</span><p>See an exhibition at the <a href="https://fitchburgartmuseum.org/visit/" target="_blank" rel="noopener noreferrer">Fitchburg Art Museum ↗</a>.</p></li>
              <li><span>Later</span><p>Check <a href="https://gardnercinemas.com/" target="_blank" rel="noopener noreferrer">Gardner Cinemas ↗</a> for a film.</p></li>
              <li><span>Dinner</span><p>Get takeout from <a href="https://www.sawaasiancuisine.com/" target="_blank" rel="noopener noreferrer">Sawa ↗</a> and stay in.</p></li>
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
            <p className={styles.eyebrow}>Restaurants, trails &amp; more</p>
            <h2 id="picks-title">Places around town.</h2>
          </div>
          <p>Food, walks, museums and a few seasonal stops. Use the filters to narrow the {explorePicks.length} listings.</p>
        </header>
        <ExploreDirectory />
      </section>

      <WachusettRail transit={feed?.transit ?? null} />
      <CommunityEvents feed={feed} />

      <section id="around-town" className={styles.chamber} aria-labelledby="chamber-title">
        <div className={styles.chamberInner}>
          <div className={styles.chamberIntro}>
            <p className={styles.eyebrow}>Greater Gardner Chamber</p>
            <h2 id="chamber-title">The Chamber directory.</h2>
            <p>
              The Greater Gardner Chamber lists local events, places to eat and
              area businesses. Check its calendar for what&apos;s happening
              during your stay.
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
            <p className={styles.chamberNote}>The Chamber maintains these listings. Event details can change.</p>
          </div>
        </div>
      </section>

      <section className={styles.back} aria-labelledby="back-title">
        <div className={styles.backPhoto}>
          <Image src={deckPhoto.src} alt={deckPhoto.alt} fill sizes="(max-width: 840px) 100vw, 47vw" />
        </div>
        <div className={styles.backCopy}>
          <p className={styles.eyebrow}>The Lodge at Kendall Pond</p>
          <h2 id="back-title">Stay at the Lodge.</h2>
          <p>
            The house sleeps up to eight and has a full kitchen, hot tub and
            waterfront yard. Check dates or take a look inside.
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
