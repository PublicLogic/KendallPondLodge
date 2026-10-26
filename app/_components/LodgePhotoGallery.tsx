"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  lodgePhotos,
  photoFilters,
  type PhotoFilterId,
} from "@/app/_data/lodge-photos";

export function LodgePhotoGallery() {
  const [filterId, setFilterId] = useState<PhotoFilterId>("all");
  const [activeOrder, setActiveOrder] = useState(1);
  const viewer = useRef<HTMLDialogElement>(null);

  const filter = photoFilters.find((item) => item.id === filterId) ?? photoFilters[0];
  const visible = filter.categories.length === 0
    ? lodgePhotos
    : lodgePhotos.filter((photo) =>
        (filter.categories as readonly string[]).includes(photo.category),
      );
  const currentIndex = Math.max(
    0,
    visible.findIndex((photo) => photo.order === activeOrder),
  );
  const activePhoto = visible[currentIndex];

  function viewPhoto(order: number) {
    setActiveOrder(order);
    if (!viewer.current?.open) viewer.current?.showModal();
  }

  function movePhoto(direction: number) {
    if (visible.length < 2) return;
    const nextIndex = (currentIndex + direction + visible.length) % visible.length;
    setActiveOrder(visible[nextIndex].order);
  }

  return (
    <>
      <div className="gallery-filter-row" aria-label="Photo categories">
        {photoFilters.map((item) => {
          const selected = item.id === filterId;
          return (
            <button
              type="button"
              key={item.id}
              className="gallery-filter"
              aria-pressed={selected}
              onClick={() => {
                setFilterId(item.id);
                setActiveOrder(1);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <p className="gallery-count" role="status" aria-live="polite">
        Showing {visible.length} photos
      </p>

      <div className="gallery-grid">
        {visible.map((photo) => (
          <button
            className="gallery-photo-card"
            key={photo.order}
            type="button"
            aria-label={"View larger photo: " + photo.alt}
            onClick={() => viewPhoto(photo.order)}
          >
            <span className="gallery-photo-frame">
              <Image
                src={photo.src}
                alt=""
                width={photo.width}
                height={photo.height}
                loading="lazy"
                sizes="(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 33vw"
              />
            </span>
            <span className="gallery-photo-caption">
              <span>{photo.alt}</span>
              <span aria-hidden="true">↗</span>
            </span>
          </button>
        ))}
      </div>

      <dialog
        className="gallery-lightbox"
        ref={viewer}
        aria-label="Property photo viewer"
        onClick={(event) => {
          if (event.target === event.currentTarget) viewer.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            movePhoto(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            movePhoto(1);
          }
        }}
      >
        <div className="gallery-lightbox-inner">
          <div className="gallery-lightbox-header">
            <span>THE LODGE AT KENDALL POND</span>
            <button type="button" onClick={() => viewer.current?.close()}>
              Close <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="gallery-lightbox-image">
            <Image
              src={activePhoto.src}
              alt={activePhoto.alt}
              width={activePhoto.width}
              height={activePhoto.height}
              sizes="(max-width: 900px) 95vw, 82vw"
            />
          </div>
          <div className="gallery-lightbox-footer">
            <button type="button" onClick={() => movePhoto(-1)} disabled={visible.length < 2}
              aria-label="Previous photo">
              <span aria-hidden="true">←</span> Previous
            </button>
            <p>{activePhoto.alt}<span>{currentIndex + 1} / {visible.length}</span></p>
            <button type="button" onClick={() => movePhoto(1)} disabled={visible.length < 2}
              aria-label="Next photo">
              Next <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
