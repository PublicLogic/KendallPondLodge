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
          <p className={styles.eyebrow}>The Lodge&apos;s local guide · Gardner &amp; Wachusett</p>
          <h1 id="explore-title">When you feel<br /><em>like heading out.</em></h1>
          <p className={styles.openingIntro}>
            A good breakfast, a walk with a view, dinner in town.
            Or stay at the Lodge all afternoon. Here are a few places we&apos;d
            put on the list while you&apos;re here.
          </p>
          <nav className={styles.openingNav} aria-label="Explore this guide">
            <a href="#days">Plan a day <span aria-hidden="true">↘</span></a>
            <a href="#local-picks">Local favorites <span aria-hidden="true">↘</span></a>
            <a href="#train">The train <span aria-hidden="true">↘</span></a>
            <a href="#city-events">Local events <span aria-hidden="true">↘</span></a>
            <a href="#around-town">Chamber <span aria-hidden="true">↘</span></a>
          </nav>
        </div>
        <figure className={styles.openingPhoto}>
          <Image src={pondPhoto.src} alt={pondPhoto.alt} fill priority
            sizes="(max-width: 840px) 100vw, 46vw" />
          <figcaption>Kendall Pond, when you get back.</figcaption>
        </figure>
      </section>

      <section className={styles.days} id="days" aria-labelledby="days-title">
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>A day out, your way</p>
            <h2 id="days-title">Pick a plan. Change it whenever.</h2>
          </div>
          <p>Nothing here needs a complicated itinerary. These are simply a few good combinations when you want to head out.</p>
        </header>
        <div className={styles.dayGrid}>
          <article className={styles.day}>
            <p className={styles.dayNumber}>01 <span>Stay close to town</span></p>
            <h3>A Gardner day</h3>
            <ol>
              <li><span>Morning</span><p>Breakfast at <a href="https://business.gardnerma.com/list/member/blue-moon-diner-1363" target="_blank" rel="noopener noreferrer">Blue Moon Diner ↗</a>.</p></li>
              <li><span>Afternoon</span><p>Spend a little time at <a href="https://www.gardnermuseuminc.com/home/hours" target="_blank" rel="noopener noreferrer">the Gardner Museum ↗</a>.</p></li>
              <li><span>Evening</span><p>Dinner at <a href="https://www.moonhillbrewing.com/" target="_blank" rel="noopener noreferrer">Gardner Ale House ↗</a>, then back to the water.</p></li>
            </ol>
          </article>
          <article className={styles.day}>
            <p className={styles.dayNumber}>02 <span>Get outside</span></p>
            <h3>A mountain day</h3>
            <ol>
              <li><span>Morning</span><p>Choose a trail at <a href="https://www.mass.gov/locations/wachusett-mountain-state-reservation" target="_blank" rel="noopener noreferrer">Wachusett Mountain ↗</a>.</p></li>
              <li><span>Afternoon</span><p>Stop at <a href="https://www.redapplefarm.com/" target="_blank" rel="noopener noreferrer">Red Apple Farm ↗</a> for cider donuts or seasonal farm activities.</p></li>
              <li><span>Evening</span><p>Cook at the Lodge, or put your feet up on the deck.</p></li>
            </ol>
          </article>
          <article className={styles.day}>
            <p className={styles.dayNumber}>03 <span>When it rains</span></p>
            <h3>An indoor afternoon</h3>
            <ol>
              <li><span>First stop</span><p>See an exhibition at the <a href="https://fitchburgartmuseum.org/visit/" target="_blank" rel="noopener noreferrer">Fitchburg Art Museum ↗</a>.</p></li>
              <li><span>Later</span><p>Check <a href="https://gardnercinemas.com/" target="_blank" rel="noopener noreferrer">Gardner Cinemas ↗</a> for a film.</p></li>
              <li><span>Dinner</span><p>Get takeout from <a href="https://www.sawaasiancuisine.com/" target="_blank" rel="noopener noreferrer">Sawa ↗</a> and stay in.</p></li>
            </ol>
          </article>
        </div>
        <p className={styles.planNote}>
          These are ideas, not reserved activities. Please check opening hours, trail conditions and availability directly with each business.
        </p>
      </section>

      <section className={styles.picks} id="local-picks" aria-labelledby="picks-title">
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>A shorter list, chosen with care</p>
            <h2 id="picks-title">Good places to know.</h2>
          </div>
          <p>Not a ranking and not every business in the region. Start with these {explorePicks.length} places, or find more through the Chamber below.</p>
        </header>
        <ExploreDirectory />
      </section>

      <WachusettRail transit={feed?.transit ?? null} />
      <CommunityEvents feed={feed} />

      <section id="around-town" className={styles.chamber} aria-labelledby="chamber-title">
        <div className={styles.chamberInner}>
          <div className={styles.chamberIntro}>
            <p className={styles.eyebrow}>More than our picks</p>
            <h2 id="chamber-title">See what&apos;s happening in Gardner.</h2>
            <p>
              The Greater Gardner Chamber of Commerce keeps a calendar of
              community and member events, plus a directory of local
              businesses. It&apos;s a good place to check for something happening
              on the dates you&apos;re visiting.
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
            <p className={styles.chamberNote}>Local listings and event details are maintained by the Greater Gardner Chamber, not by the Lodge.</p>
          </div>
        </div>
      </section>

      <section className={styles.back} aria-labelledby="back-title">
        <div className={styles.backPhoto}>
          <Image src={deckPhoto.src} alt={deckPhoto.alt} fill sizes="(max-width: 840px) 100vw, 47vw" />
        </div>
        <div className={styles.backCopy}>
          <p className={styles.eyebrow}>And when you get back</p>
          <h2 id="back-title">The deck is still here.</h2>
          <p>
            A day around Gardner, an afternoon on Wachusett, or a movie when
            it rains. Then you come home to the Lodge.
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
