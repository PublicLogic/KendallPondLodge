"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  lodgePhotos,
  photoFilters,
  type PhotoFilterId,
} from "@/app/_data/lodge-photos";

type TouchPoint = { x: number; y: number };

export function LodgePhotoGallery() {
  const [filterId, setFilterId] = useState<PhotoFilterId>("all");
  const [activeOrder, setActiveOrder] = useState(lodgePhotos[0].order);
  const [isOpen, setIsOpen] = useState(false);
  const viewer = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const touchStart = useRef<TouchPoint | null>(null);

  const filter = photoFilters.find((item) => item.id === filterId) ?? photoFilters[0];
  const visible = filter.categories.length === 0
    ? lodgePhotos
    : lodgePhotos.filter((photo) =>
        (filter.categories as readonly string[]).includes(photo.category),
      );
  const currentIndex = Math.max(0, visible.findIndex((photo) => photo.order === activeOrder));
  const activePhoto = visible[currentIndex] ?? lodgePhotos[0];

  function chooseFilter(id: PhotoFilterId) {
    const choice = photoFilters.find(item => item.id === id) ?? photoFilters[0];
    const subset = choice.categories.length === 0
      ? lodgePhotos
      : lodgePhotos.filter(photo => (choice.categories as readonly string[]).includes(photo.category));
    setFilterId(id);
    setActiveOrder(subset[0]?.order ?? lodgePhotos[0].order);
  }

  function viewPhoto(order: number, trigger: HTMLButtonElement) {
    lastTrigger.current = trigger;
    setActiveOrder(order);
    setIsOpen(true);
    if (!viewer.current?.open) viewer.current?.showModal();
  }

  function movePhoto(direction: number) {
    if (visible.length < 2) return;
    const nextIndex = (currentIndex + direction + visible.length) % visible.length;
    setActiveOrder(visible[nextIndex].order);
  }

  function finishSwipe(x: number, y: number) {
    if (!touchStart.current) return;
    const deltaX = x - touchStart.current.x;
    const deltaY = y - touchStart.current.y;
    touchStart.current = null;
    // Ignore normal vertical scrolling and accidental drags.
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) return;
    movePhoto(deltaX < 0 ? 1 : -1);
  }

  return (
    <>
      <nav className="gallery-filter-row" aria-label="Filter Lodge photographs">
        {photoFilters.map((item) => {
          const selected = item.id === filterId;
          const count = item.categories.length === 0
            ? lodgePhotos.length
            : lodgePhotos.filter(photo => (item.categories as readonly string[]).includes(photo.category)).length;
          return (
            <button
              type="button"
              key={item.id}
              className="gallery-filter"
              aria-pressed={selected}
              aria-controls="lodge-gallery-grid"
              onClick={() => chooseFilter(item.id)}
            >
              {item.label}<span className="gallery-filter-count" aria-hidden="true">{count}</span>
            </button>
          );
        })}
      </nav>

      <p className="gallery-count" role="status" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "photo" : "photos"}
        {filterId !== "all" ? " · " + filter.label : ""}
      </p>

      <div className="gallery-grid" id="lodge-gallery-grid">
        {visible.map((photo) => (
          <button
            className="gallery-photo-card"
            key={photo.order}
            type="button"
            aria-haspopup="dialog"
            aria-label={"View full-size photo: " + photo.alt}
            onClick={(event) => viewPhoto(photo.order, event.currentTarget)}
          >
            <span className="gallery-photo-frame">
              <Image
                src={photo.src}
                alt=""
                width={photo.width}
                height={photo.height}
                loading="lazy"
                sizes="(max-width: 560px) 50vw, (max-width: 800px) 55vw, (max-width: 1200px) 44vw, 35vw"
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
        aria-label="Lodge photograph viewer"
        onClose={() => {
          setIsOpen(false);
          touchStart.current = null;
          lastTrigger.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) viewer.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            movePhoto(-1);
          } else if (event.key === "ArrowRight") {
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
          <div
            className="gallery-lightbox-image"
            onTouchStart={(event) => {
              const point = event.touches[0];
              if (point) touchStart.current = { x: point.clientX, y: point.clientY };
            }}
            onTouchEnd={(event) => {
              const point = event.changedTouches[0];
              if (point) finishSwipe(point.clientX, point.clientY);
            }}
            onTouchCancel={() => { touchStart.current = null; }}
          >
            {isOpen && (
              <Image
                src={activePhoto.src}
                alt={activePhoto.alt}
                width={activePhoto.width}
                height={activePhoto.height}
                sizes="(max-width: 900px) 95vw, 82vw"
              />
            )}
          </div>
          <div className="gallery-lightbox-footer">
            <button type="button" onClick={() => movePhoto(-1)} disabled={visible.length < 2}
              aria-label="Previous photograph">
              <span aria-hidden="true">←</span> Previous
            </button>
            <p aria-live="polite">{activePhoto.alt}<span>{currentIndex + 1} / {visible.length}</span></p>
            <button type="button" onClick={() => movePhoto(1)} disabled={visible.length < 2}
              aria-label="Next photograph">
              Next <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
