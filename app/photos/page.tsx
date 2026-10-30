import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { LodgePhotoGallery } from "@/app/_components/LodgePhotoGallery";
import { lodgePhoto, lodgePhotos } from "@/app/_data/lodge-photos";
import { directBookingEnabled } from "@/lib/booking-db";
import styles from "./photos.module.css";

export const metadata: Metadata = {
  title: "Photos | Inside the Lodge and Along Kendall Pond",
  description:
    "Take a look around the Lodge at Kendall Pond in Gardner, Massachusetts: the house, bedrooms, living spaces, deck, hot tub, firepit, private dock and waterfront.",
  alternates: { canonical: "/photos" },
};

const airbnb =
  process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() ||
  "https://www.airbnb.com/rooms/1667597913565948713";

const coverPhoto = lodgePhoto(35);
const mainPhoto = lodgePhoto(7);
const detailPhoto = lodgePhoto(25);
const hotTubPhoto = lodgePhoto(4);

export default function PhotosPage() {
  const bookEnabled = directBookingEnabled();
  const bookingHref = bookEnabled ? "/book" : airbnb;
  const bookingLabel = bookEnabled ? "Check your dates" : "View dates on Airbnb";

  return (
    <main id="main-content" className={"gallery-page " + styles.page} data-lodge-photos>
      <section className={styles.cover} aria-labelledby="gallery-title" data-retreat-hero data-gallery-cover>
        <Image
          className={styles.coverImage}
          src={coverPhoto.src}
          alt={coverPhoto.alt}
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
          <div className={styles.coverCopy}>
            <p className={styles.eyebrow}>The place, in pictures</p>
            <h1 id="gallery-title">Take a look<br /><em>around.</em></h1>
            <p>Inside the house, out on the deck, and down by the water. All {lodgePhotos.length} photos, so you can see the place before you book.</p>
            <div className={styles.coverActions}>
              <a className={styles.primaryAction} href="#all-photos">
                Browse all {lodgePhotos.length} photos <span aria-hidden="true">↓</span>
              </a>
              <a
                className={styles.secondaryAction}
                href={bookingHref}
                {...(!bookEnabled ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {bookingLabel} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div className={styles.coverFoot}>
            <span>Hosted by Nate &amp; Allie</span>
            <span>The whole waterfront house</span>
          </div>
        </div>
      </section>

      <section className={styles.highlights} aria-labelledby="highlights-title">
        <div className={styles.sectionTop}>
          <div>
            <p className={styles.eyebrow}>Around the Lodge</p>
            <h2 id="highlights-title">The house. The rooms. The water.</h2>
          </div>
          <Link href="/lodge" className={styles.inlineLink}>See the full Lodge walkthrough <span aria-hidden="true">→</span></Link>
        </div>
        <div className={styles.highlightsGrid}>
          <Link className={styles.highlightLarge} href="/lodge">
            <span className={styles.highlightImage}>
              <Image src={mainPhoto.src} alt={mainPhoto.alt} fill sizes="(max-width: 760px) 100vw, 56vw" />
            </span>
            <span className={styles.highlightCaption}><span>The whole house</span><span aria-hidden="true">↗</span></span>
          </Link>
          <div className={styles.highlightsSide}>
            <Link className={styles.highlightSmall} href="/lodge#sleeping">
              <span className={styles.highlightImage}>
                <Image src={detailPhoto.src} alt={detailPhoto.alt} fill sizes="(max-width: 760px) 100vw, 32vw" />
              </span>
              <span className={styles.highlightCaption}><span>The bedrooms</span><span aria-hidden="true">↗</span></span>
            </Link>
            <Link className={styles.highlightSmall} href="/grounds">
              <span className={styles.highlightImage}>
                <Image src={hotTubPhoto.src} alt={hotTubPhoto.alt} fill sizes="(max-width: 760px) 100vw, 32vw" />
              </span>
              <span className={styles.highlightCaption}><span>The hot tub &amp; waterfront</span><span aria-hidden="true">↗</span></span>
            </Link>
          </div>
        </div>
      </section>

      <section id="all-photos" className={styles.collection} aria-labelledby="gallery-browse-title">
        <div className={styles.collectionHead}>
          <div>
            <p className={styles.eyebrow}>All {lodgePhotos.length} photographs</p>
            <h2 id="gallery-browse-title">See every corner.</h2>
            <p>Choose an area, or scroll through the whole house and grounds.</p>
          </div>
          <Link href="/lodge" className={styles.inlineLink}>
            House details &amp; sleeping plan <span aria-hidden="true">→</span>
          </Link>
        </div>
        <LodgePhotoGallery />
        <p className={styles.seasonNote}>Photos were taken across different seasons. Outdoor equipment and furnishings may vary; ask about anything important for your dates.</p>
      </section>

      <section className={styles.close} aria-labelledby="gallery-close-title">
        <div className={styles.closeInner}>
          <div>
            <p className={styles.eyebrow}>Hosted locally by Nate &amp; Allie</p>
            <h2 id="gallery-close-title">Got a weekend<br />in mind?</h2>
            <p>{bookEnabled
              ? "Choose your dates, check availability, and review the full price and terms before you book."
              : "Take a look at available dates and pricing on our Airbnb listing."}</p>
          </div>
          <div className={styles.closeActions}>
            {bookEnabled ? (
              <Link href="/book" className={styles.closeButton}>Check your dates <span aria-hidden="true">↗</span></Link>
            ) : (
              <a href={airbnb} className={styles.closeButton} target="_blank" rel="noopener noreferrer">
                Check dates on Airbnb <span aria-hidden="true">↗</span>
              </a>
            )}
            <Link href="/grounds" className={styles.closeLink}>See the waterfront <span aria-hidden="true">→</span></Link>
            <Link href="/guidebook" className={styles.closeLink}>Already booked? Guest Guide <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
