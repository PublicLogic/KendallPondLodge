import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { LodgePhotoGallery } from "@/app/_components/LodgePhotoGallery";
import { lodgePhoto, lodgePhotos } from "@/app/_data/lodge-photos";
import { directBookingEnabled } from "@/lib/booking-db";

export const metadata: Metadata = {
  title: "Photos of the Lodge & Waterfront",
  description:
    "Photos of the Lodge at Kendall Pond in Gardner, Massachusetts, including bedrooms, living spaces, deck, hot tub and private waterfront.",
};

const airbnb =
  process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() ||
  "https://www.airbnb.com/rooms/1667597913565948713";

export default function PhotosPage() {
  const mainPhoto = lodgePhoto(3);
  const detailPhoto = lodgePhoto(4);
  const bookEnabled = directBookingEnabled();

  return (
    <main id="main-content" className="gallery-page">
      <section className="gallery-intro" aria-labelledby="gallery-title">
        <div className="gallery-intro-copy">
          <p className="showcase-eyebrow">Photo gallery</p>
          <h1 id="gallery-title">The Lodge, in photos.</h1>
          <p>
            Browse {" "}{lodgePhotos.length} photos of the rooms, deck, hot tub,
            dock, and shoreline. Choose a category below to see more of each space.
          </p>
          <p className="gallery-intro-note">These photos were taken at different times of year. Furniture and outdoor amenities may vary by season.</p>
          <a className="showcase-inline-link" href="#all-photos">
            Browse the gallery <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="gallery-intro-visual">
          <div className="gallery-intro-large">
            <Image
              src={mainPhoto.src}
              alt={mainPhoto.alt}
              fill
              priority
              sizes="(max-width: 850px) 100vw, 43vw"
            />
          </div>
          <div className="gallery-intro-small">
            <Image
              src={detailPhoto.src}
              alt={detailPhoto.alt}
              fill
              sizes="(max-width: 850px) 50vw, 18vw"
            />
          </div>
        </div>
      </section>

      <section id="all-photos" className="gallery-content" aria-labelledby="gallery-browse-title">
        <div className="showcase-section-head">
          <div>
            <p className="showcase-eyebrow">Browse by area</p>
            <h2 id="gallery-browse-title">Rooms, grounds, and waterfront.</h2>
          </div>
          <Link href="/lodge" className="showcase-inline-link">
            See the Lodge details <span aria-hidden="true">→</span>
          </Link>
        </div>
        <LodgePhotoGallery />
      </section>

      <section className="showcase-close gallery-close" aria-labelledby="gallery-close-title">
        <div>
          <p className="showcase-eyebrow">Booking</p>
          <h2 id="gallery-close-title">Interested in staying?</h2>
          <p>
            {bookEnabled
              ? "Send us your dates and we’ll check availability. You’ll get a full quote before any charge."
              : "See dates and prices on our Airbnb listing."}
          </p>
        </div>
        <div className="showcase-close-actions">
          {bookEnabled ? (
            <Link href="/book" className="showcase-button showcase-button-dark">
              Check your dates <span aria-hidden="true">↗</span>
            </Link>
          ) : (
            <a href={airbnb} target="_blank" rel="noopener noreferrer"
              className="showcase-button showcase-button-dark">
              Check dates on Airbnb <span aria-hidden="true">↗</span>
            </a>
          )}
          <Link href="/grounds" className="showcase-inline-link">
            Explore the waterfront <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
