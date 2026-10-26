import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { LodgePhotoGallery } from "@/app/_components/LodgePhotoGallery";
import { lodgePhoto, lodgePhotos } from "@/app/_data/lodge-photos";
import { directBookingEnabled } from "@/lib/booking-db";

export const metadata: Metadata = {
  title: "Photos of the Lodge & Waterfront",
  description:
    "Explore 50 real photos of the Lodge at Kendall Pond: bedrooms, great room, kitchen, private waterfront, dock, deck, hot tub and firepit in Gardner, Massachusetts.",
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
          <p className="showcase-eyebrow">Actual photos of the Lodge</p>
          <h1 id="gallery-title">Picture your days here.</h1>
          <p>
            The actual Lodge, from the rooms to the shoreline. Browse all
            {" "}{lodgePhotos.length} curated photos or choose the part you want to see.
          </p>
          <p className="gallery-intro-note">No stock imagery. Photos show the property across different seasons; furnishings and amenities may change.</p>
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
            <p className="showcase-eyebrow">Look around</p>
            <h2 id="gallery-browse-title">Every corner, at your pace.</h2>
          </div>
          <Link href="/lodge" className="showcase-inline-link">
            Read about the Lodge <span aria-hidden="true">→</span>
          </Link>
        </div>
        <LodgePhotoGallery />
      </section>

      <section className="showcase-close gallery-close" aria-labelledby="gallery-close-title">
        <div>
          <p className="showcase-eyebrow">Ready to find a weekend?</p>
          <h2 id="gallery-close-title">Come see it in person.</h2>
          <p>
            {bookEnabled
              ? "Send us your dates. We'll confirm the live calendar and send an itemized quote before payment."
              : "Check available dates and reservation options on Airbnb."}
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
