import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { lodgePhoto, type LodgePhoto } from "@/app/_data/lodge-photos";
import { PondScenery } from "@/app/_components/PondScenery";
import { directBookingEnabled, hostContactHref } from "@/lib/booking-db";
import styles from "./grounds.module.css";

export const metadata: Metadata = {
  title: "Waterfront | Dock, Hot Tub, Deck & Firepit",
  description:
    "Take a look at the Lodge at Kendall Pond's private dock and shoreline, deck, covered hot tub, stone firepit, and waterfront lawn in Gardner, Massachusetts.",
  alternates: { canonical: "/grounds" },
};

// Every foreground image is an actual Lodge/property photograph from the
// curated manifest. Third-party pond aerials never appear in the cover.
const photos = {
  cover: lodgePhoto(50),
  shoreline: lodgePhoto(42),
  dock: lodgePhoto(43),
  deck: lodgePhoto(31),
  hotTub: lodgePhoto(4),
  firepit: lodgePhoto(40),
  lawn: lodgePhoto(6),
};

function Photograph({
  photo,
  caption,
  detail,
  className = "",
  sizes = "(max-width: 760px) calc(100vw - 36px), (max-width: 1320px) 48vw, 620px",
}: {
  photo: LodgePhoto;
  caption: string;
  detail?: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <figure className={styles.photo + (className ? " " + className : "")}>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        loading="lazy"
      />
      <figcaption>
        <span>{caption}</span>
        {detail && <span className={styles.captionDetail}>{detail}</span>}
      </figcaption>
    </figure>
  );
}

export default function GroundsPage() {
  const directEnabled = directBookingEnabled();
  const bookingHref = directEnabled ? "/book" : "/rates";
  const bookingLabel = directEnabled ? "Check your dates" : "See rates";

  return (
    <main id="main-content" className={styles.page} data-waterfront-editorial>
      <section className={styles.cover} aria-labelledby="waterfront-title" data-retreat-hero data-waterfront-cover>
        <Image
          className={styles.coverImage}
          src={photos.cover.src}
          alt={photos.cover.alt}
          fill
          priority
          sizes="100vw"
          style={{ objectPosition: "center 54%" }}
        />
        <div className={styles.coverShade} aria-hidden="true" />
        <div className={styles.coverInner}>
          <div className={styles.location}>
            <span>The Lodge at Kendall Pond</span>
            <span>Gardner, Massachusetts</span>
          </div>
          <div className={styles.coverStory}>
            <p className={styles.eyebrow}>Outside at the Lodge</p>
            <h1 id="waterfront-title">From the deck<br /><em>to the dock.</em></h1>
            <p>
              The deck looks out over Kendall Pond. Walk across the lawn to
              the firepit and our private dock. The hot tub is tucked under
              the deck.
            </p>
            <div className={styles.coverActions}>
              <Link className={styles.primaryAction} href={bookingHref}>
                {bookingLabel} <span aria-hidden="true">↗</span>
              </Link>
              <a className={styles.secondaryAction} href="#shoreline">
                Come down to the water <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className={styles.coverFoot}>
            <span>Private dock &amp; shoreline</span>
            <span>Hosted locally by Nate &amp; Allie</span>
          </div>
        </div>
      </section>

      <nav className={styles.pageNav} aria-label="On the waterfront page">
        <div className={styles.pageNavInner}>
          <a href="#shoreline">Dock &amp; shoreline</a>
          <a href="#deck">The deck</a>
          <a href="#hot-tub">Hot tub</a>
          <a href="#firepit">Firepit &amp; lawn</a>
          <a href="#conditions">Good to know</a>
        </div>
      </nav>

      <section id="shoreline" className={styles.section + " " + styles.shoreline} aria-labelledby="shoreline-title">
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>At the water's edge</p>
            <h2 id="shoreline-title">A place to sit<br />by the water.</h2>
          </div>
          <p>
            The lawn runs down to the Lodge's private dock, with places to
            sit and look out over Kendall Pond. It's close enough to wander
            down whenever you feel like it.
          </p>
        </div>
        <div className={styles.shorelineGrid}>
          <Photograph
            photo={photos.shoreline}
            caption="From the lawn to the dock"
            detail="Waterside seating · private shoreline"
            className={styles.shorelineLead}
            sizes="(max-width: 760px) calc(100vw - 36px), (max-width: 1320px) 60vw, 770px"
          />
          <Photograph
            photo={photos.dock}
            caption="The private dock"
            detail="Seasonal use · weather permitting"
            sizes="(max-width: 760px) calc(100vw - 36px), (max-width: 1320px) 36vw, 475px"
          />
        </div>
      </section>

      <section id="deck" className={styles.featureBand} aria-labelledby="deck-title">
        <div className={styles.feature}>
          <div className={styles.featureCopy}>
            <p className={styles.eyebrow}>Upstairs</p>
            <h2 id="deck-title">Dinner on<br />the deck.</h2>
            <p>
              Outdoor dining, a grill, and room to sit with the pond in
              front of you. The deck is just off the main living space.
            </p>
            <Link className={styles.textLink} href="/lodge">
              See inside the Lodge <span aria-hidden="true">→</span>
            </Link>
          </div>
          <Photograph
            photo={photos.deck}
            caption="Outdoor dining above the waterfront"
            detail="Deck · grill · seating"
            className={styles.featurePhoto}
            sizes="(max-width: 760px) 100vw, (max-width: 1320px) 57vw, 760px"
          />
        </div>
      </section>

      <section id="hot-tub" className={styles.feature + " " + styles.hotTub} aria-labelledby="hot-tub-title">
        <Photograph
          photo={photos.hotTub}
          caption="The hot tub overlooking Kendall Pond"
          detail="Covered lower patio"
          className={styles.featurePhoto}
          sizes="(max-width: 760px) 100vw, (max-width: 1320px) 57vw, 760px"
        />
        <div className={styles.featureCopy}>
          <p className={styles.eyebrow}>Downstairs</p>
          <h2 id="hot-tub-title">The hot tub<br />has a view, too.</h2>
          <p>
            The hot tub sits under the covered deck, looking out toward the
            lawn and water. The downstairs doors open onto the same patio.
          </p>
          <Link className={styles.textLink} href="/photos">
            See more photos <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section id="firepit" className={styles.section + " " + styles.firepit} aria-labelledby="firepit-title">
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>Across the lawn</p>
            <h2 id="firepit-title">There's a firepit<br />by the shore.</h2>
          </div>
          <p>
            There are chairs around the stone firepit near the shoreline,
            with lawn between the house and the water and space to spread out.
          </p>
        </div>
        <div className={styles.firepitGrid}>
          <Photograph
            photo={photos.firepit}
            caption="Stone firepit by the water"
            detail="Shoreline seating"
          />
          <Photograph
            photo={photos.lawn}
            caption="The lawn between the Lodge and the pond"
            detail="Room to spread out"
          />
        </div>
      </section>

      <section id="conditions" className={styles.conditions} aria-labelledby="conditions-title">
        <PondScenery scene="waterfront" />
        <div className={styles.conditionsInner}>
          <div className={styles.conditionsIntro}>
            <p className={styles.eyebrow}>Before you head outside</p>
            <h2 id="conditions-title">Waterfront<br />basics.</h2>
            <p>
              The pond changes with the season, and so does what you can
              use on it. If a particular outdoor amenity matters to your
              plans, check with us before you book.
            </p>
          </div>
          <dl className={styles.conditionsList}>
            <div>
              <dt>Dock &amp; watercraft</dt>
              <dd>Dock use, kayaks, and the paddle boat depend on the season and conditions. Ask what's available for your dates.</dd>
            </div>
            <div>
              <dt>Children &amp; pets</dt>
              <dd>Children and pets need close supervision near the pond and dock.</dd>
            </div>
            <div>
              <dt>Quiet by the water</dt>
              <dd>Sound carries across the pond. Quiet hours are 10 p.m. to 7 a.m.</dd>
            </div>
          </dl>
          <a className={styles.questionLink} href={hostContactHref()}>
            A question about the waterfront? Ask Nate &amp; Allie <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className={styles.close} aria-labelledby="waterfront-book-title">
        <div className={styles.closeInner}>
          <div>
            <p className={styles.eyebrow}>See you at the pond</p>
            <h2 id="waterfront-book-title">Come stay<br />by the water.</h2>
            <p>
              Check your dates and review the full price and terms before
              you decide.
            </p>
          </div>
          <div className={styles.closeActions}>
            <Link className={styles.closeButton} href={bookingHref}>
              {bookingLabel} <span aria-hidden="true">↗</span>
            </Link>
            <Link className={styles.closeLink} href="/lodge">
              See inside the house <span aria-hidden="true">→</span>
            </Link>
            <Link className={styles.closeLink} href="/photos">
              See all Lodge photos <span aria-hidden="true">→</span>
            </Link>
            <p>Already booked? <Link href="/guidebook">Open the Guest Guide</Link>.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
