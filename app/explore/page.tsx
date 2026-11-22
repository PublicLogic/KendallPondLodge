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

  return (
    <main id="main-content" className={styles.page} data-curated-explore>
      <section className={styles.opening} aria-labelledby="explore-title">
        <div className={styles.openingCopy}>
          <p className={styles.eyebrow}>Gardner &amp; the Wachusett area</p>
          <h1 id="explore-title">A weekend in Gardner and at Wachusett Mountain.</h1>
          <p className={styles.openingIntro}>
            Stay on Kendall Pond in Gardner for a weekend of local food, pond walks, and time on Wachusett Mountain in Princeton. Here are two ways to plan your days.
          </p>
          <nav className={styles.openingNav} aria-label="Explore this guide">
            <a href="#local-picks">Places</a>
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

      <section className={styles.picks} aria-labelledby="weekend-plans">
        <h2 id="weekend-plans">Plan your stay on Kendall Pond</h2>
        <h3>A family day in Gardner</h3>
        <p>Start at Dunn State Park on Pearl Street. Follow the trail beside Dunn Pond or bring fishing gear for the piers. Back at the lodge, the private dock looks out over a different pond: Kendall Pond. The three-bedroom house sleeps up to eight overnight guests.</p>
        <a href="https://www.mass.gov/locations/dunn-state-park">Dunn State Park trails and visitor information</a>
        <h3>A Wachusett Mountain weekend</h3>
        <p>For a ski day, head to the ski area at 499 Mountain Road in Princeton. For a hike, use the state reservation’s trail map and check its seasonal road notices before leaving Gardner. Spend the evening back at the house, with a full kitchen and hot tub.</p>
        <p><a href="https://www.mass.gov/locations/wachusett-mountain-state-reservation">Wachusett hiking maps and road notices</a></p>
        <Link href={bookingHref}>{bookingHref === "/book" ? "Check lodge availability for your weekend" : "See lodge rates"}</Link>
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

      <section className={styles.back} aria-labelledby="back-title">
        <div className={styles.backPhoto}>
          <Image src={deckPhoto.src} alt={deckPhoto.alt} fill sizes="(max-width: 840px) 100vw, 47vw" />
        </div>
        <div className={styles.backCopy}>
          <p className={styles.eyebrow}>Or don&apos;t go anywhere</p>
          <h2 id="back-title">Or bring dinner back.</h2>
          <p>
            The kitchen&apos;s ready, the deck is just outside, and you don&apos;t need another plan.
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
