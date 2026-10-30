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
    "Our local notes from the Lodge at Kendall Pond: where to eat in Gardner, Wachusett trails, Red Apple Farm, museums, train connections and events.",
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
          <p className={styles.eyebrow}>Gardner &amp; the Wachusett area</p>
          <h1 id="explore-title">Worth leaving the dock for.</h1>
          <p className={styles.openingIntro}>
            Breakfast at the Blue Moon. Wachusett when the weather&apos;s good.
            Cider donuts in Phillipston. We live nearby, so these are
            the places we'd tell you about.
          </p>
          <nav className={styles.openingNav} aria-label="Explore this guide">
            <a href="#days">A day out</a>
            <a href="#local-picks">Our list</a>
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
            <p className={styles.eyebrow}>If you want to get out</p>
            <h2 id="days-title">Make a day of it.</h2>
          </div>
          <p>Stay around Gardner, make a trip up Wachusett, or find something indoors. Do all three stops or just one.</p>
        </header>
        <div className={styles.dayGrid}>
          <article className={styles.day}>
            <p className={styles.dayArea}>Gardner</p>
            <h3>In town all day.</h3>
            <ol>
              <li><span>Morning</span><p>Start at <a href="https://business.gardnerma.com/list/member/blue-moon-diner-1363" target="_blank" rel="noopener noreferrer">Blue Moon Diner ↗</a> for breakfast.</p></li>
              <li><span>Midday</span><p>Find out why Gardner is called the Chair City at <a href="https://www.gardnermuseuminc.com/home/hours" target="_blank" rel="noopener noreferrer">the Gardner Museum ↗</a>. Check open days.</p></li>
              <li><span>Evening</span><p>Head downtown for dinner at <a href="https://www.moonhillbrewing.com/" target="_blank" rel="noopener noreferrer">Gardner Ale House ↗</a>.</p></li>
            </ol>
          </article>
          <article className={styles.day}>
            <p className={styles.dayArea}>Wachusett &amp; Phillipston</p>
            <h3>A hike and a cider donut.</h3>
            <ol>
              <li><span>Morning</span><p>Pick a trail at <a href="https://www.mass.gov/locations/wachusett-mountain-state-reservation" target="_blank" rel="noopener noreferrer">Wachusett Mountain ↗</a>. Check the trail map first.</p></li>
              <li><span>Afternoon</span><p>Make the donut stop at <a href="https://www.redapplefarm.com/" target="_blank" rel="noopener noreferrer">Red Apple Farm ↗</a>. The farm calendar changes with the season.</p></li>
              <li><span>Evening</span><p>Back to the Lodge. No schedule for the rest of the night.</p></li>
            </ol>
          </article>
          <article className={styles.day}>
            <p className={styles.dayArea}>Fitchburg &amp; Gardner</p>
            <h3>One for a rainy day.</h3>
            <ol>
              <li><span>First stop</span><p>See what&apos;s hanging at the <a href="https://fitchburgartmuseum.org/visit/" target="_blank" rel="noopener noreferrer">Fitchburg Art Museum ↗</a>.</p></li>
              <li><span>Later</span><p>Catch a movie at <a href="https://gardnercinemas.com/" target="_blank" rel="noopener noreferrer">Gardner Cinemas ↗</a> if something good is playing.</p></li>
              <li><span>Dinner</span><p>Bring <a href="https://www.sawaasiancuisine.com/" target="_blank" rel="noopener noreferrer">Sawa ↗</a> takeout home. No more going out.</p></li>
            </ol>
          </article>
        </div>
        <p className={styles.planNote}>
          Check hours and trail conditions first. Farm activities and ski days are seasonal.
        </p>
      </section>

      <section className={styles.picks} id="local-picks" aria-labelledby="picks-title">
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Food, trails &amp; rainy days</p>
            <h2 id="picks-title">Keep these handy.</h2>
          </div>
          <p>Breakfast, dinner, a short walk, or a hike up Wachusett. Pick what sounds good from the {explorePicks.length} places below.</p>
        </header>
        <ExploreDirectory />
      </section>

      <WachusettRail transit={feed?.transit ?? null} />
      <CommunityEvents feed={feed} />

      <section id="around-town" className={styles.chamber} aria-labelledby="chamber-title">
        <div className={styles.chamberInner}>
          <div className={styles.chamberIntro}>
            <p className={styles.eyebrow}>Greater Gardner Chamber</p>
            <h2 id="chamber-title">Don&apos;t stop at our list.</h2>
            <p>
              Need another dinner option or something happening this weekend?
              The Greater Gardner Chamber has the longer list of local
              businesses and events.
            </p>
          </div>
          <div className={styles.chamberLinks}>
            <a href={localResourceLinks.chamberEvents} target="_blank" rel="noopener noreferrer">
              <span><small>What&apos;s on</small><strong>Community &amp; Chamber events</strong></span><span aria-hidden="true">↗</span>
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

      <section className={styles.back} aria-labelledby="back-title">
        <div className={styles.backPhoto}>
          <Image src={deckPhoto.src} alt={deckPhoto.alt} fill sizes="(max-width: 840px) 100vw, 47vw" />
        </div>
        <div className={styles.backCopy}>
          <p className={styles.eyebrow}>Or don&apos;t go anywhere</p>
          <h2 id="back-title">Staying in works too.</h2>
          <p>
            Bring dinner home. The kitchen&apos;s yours, the deck looks out
            over the water, and there&apos;s no need to make another plan.
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
