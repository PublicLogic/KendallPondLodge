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

const title = "Things to Do in Gardner, MA & Near Wachusett Mountain";
const description = "Explore Gardner’s Main Street shops, Wachusett Mountain trails and ski area, and Kendall Pond event venues with a local guide from Nate and Allie.";
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/explore" },
  openGraph: { title, description, url: "/explore", siteName: "The Lodge at Kendall Pond", type: "website", images: ["/images/kpl/fall-pond.webp"] },
  twitter: { card: "summary_large_image", title, description, images: ["/images/kpl/fall-pond.webp"] },
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
          <p className={styles.eyebrow}>A local guide from Nate &amp; Allie</p>
          <h1 id="explore-title">Worth leaving the dock for.</h1>
          <p className={styles.openingIntro}>
            Walk the trails on Wachusett Mountain in Princeton, then head into downtown Gardner for dinner at the Ale House on Parker Street. Our map starts at Kendall Pond and takes you to the places we recommend along the way.
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
            <p className={styles.eyebrow}>Local favorites</p>
            <h2 id="picks-title">Things to do in Gardner, MA, and near Wachusett Mountain</h2>
          </div>
        </header>
        <ExploreDirectory places={feed?.places ?? []} />
      </section>

      <section className={styles.picks} aria-labelledby="weekend-plans">
        <h2 id="weekend-plans">Made here</h2>
        <h3 id="farm-shop-supper">Smith’s Country Cheese, Winchendon</h3>
        <p>At the Winchendon farm shop, a window looks into the cheesemaking room. Time your visit right and you can watch the crew make the cheese you’ll find at the counter.</p>
        <a href="https://smithscountrycheese.com/visit-the-farm/">Visit the farm and country shop</a>
        <h3>Priscilla Candy Shop, Gardner</h3>
        <p>Charlie Stephano founded Priscilla Candy Shop in Gardner in 1936. His French Roll is still on the counter at 4 Main Street. It has a soft chocolate center dipped in milk chocolate and rolled in roasted cashews.</p>
        <a href="https://www.priscillacandy.com/">Explore Priscilla’s chocolates</a>
      </section>

      <WachusettRail transit={feed?.transit ?? null} />
      <CommunityEvents feed={feed} />

      <section id="around-town" className={styles.chamber} aria-labelledby="chamber-title">
        <div className={styles.chamberInner}>
          <div className={styles.chamberIntro}>

            <h2 id="chamber-title">Around Greater Gardner</h2>
            <p className={styles.chamberNote}>These are Chamber listings.</p>
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
          <p>Planning a reunion, wedding weekend or retreat? Stay at <Link href="/lodge">the lodge</Link> and ask us for an introduction to a restaurant, local business or function hall.</p>
          <p>The <a href="https://www.gardnerpacc.com/">Gardner PACC</a> has a banquet hall on Kendall Pond and a pavilion for seasonal outings.</p>
          <p>For larger events, our team at PublicLogic can help contact venues, build a schedule and coordinate the day. Tell us your dates and approximate headcount.</p>
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
