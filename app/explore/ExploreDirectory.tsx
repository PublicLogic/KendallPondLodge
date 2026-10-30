"use client";

import { useState } from "react";
import {
  exploreCategories,
  explorePicks,
  type ExploreCategory,
  type ExplorePick,
} from "./guide-data";
import styles from "./explore.module.css";

type FilterId = "all" | ExploreCategory;

function PlacePhoto({ place }: { place: ExplorePick }) {
  const [imageAvailable, setImageAvailable] = useState(true);

  return (
    <figure className={styles.placeFigure}>
      <a
        className={styles.placeImageLink}
        href={place.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={"Open " + place.name + " details (opens a new tab)"}
      >
        <div className={styles.placeImage}>
          <div className={styles.placeImageFallback} aria-hidden="true">
            <span>{place.location}</span>
            <strong>{place.name}</strong>
          </div>
          {imageAvailable && (
            // These are attributed, externally hosted editorial previews.
            // Do not rehost these images or claim that KPL owns the photos.
            // Keep a readable fallback if the owner blocks hotlinking.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.placeImageActual}
              src={place.image.src}
              alt={place.image.alt}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setImageAvailable(false)}
            />
          )}
          <span className={styles.placeImageAction} aria-hidden="true">↗</span>
        </div>
      </a>
      <figcaption className={styles.placeImageCredit}>
        {imageAvailable ? (
          <>
            Photo:{" "}
            <a href={place.image.sourceUrl} target="_blank" rel="noopener noreferrer">
              {place.image.credit}
            </a>
          </>
        ) : "Photo unavailable"}
      </figcaption>
    </figure>
  );
}

export function ExploreDirectory() {
  const [selected, setSelected] = useState<FilterId>("all");
  const visible = selected === "all"
    ? explorePicks
    : explorePicks.filter((place) => place.category === selected);

  return (
    <>
      <div className={styles.filters} role="group" aria-label="Filter local recommendations">
        {exploreCategories.map((option) => {
          const count = option.id === "all"
            ? explorePicks.length
            : explorePicks.filter((place) => place.category === option.id).length;
          return (
            <button
              type="button"
              key={option.id}
              aria-pressed={selected === option.id}
              aria-controls="explore-picks"
              onClick={() => setSelected(option.id)}
            >
              {option.label} <span aria-hidden="true">{count}</span>
            </button>
          );
        })}
      </div>
      <p className={styles.count} role="status" aria-live="polite">
        {visible.length} {visible.length === 1 ? "spot" : "spots"} on the list
      </p>
      <div className={styles.directory} id="explore-picks">
        {visible.map((place) => (
          <article className={styles.pick} key={place.slug}>
            <PlacePhoto place={place} />
            <div className={styles.pickBody}>
              <p className={styles.pickCategory}>
                {place.location} <span>· {place.bestFor}</span>
              </p>
              <h3>
                <a className={styles.pickName} href={place.url} target="_blank" rel="noopener noreferrer">
                  {place.name}
                </a>
              </h3>
              <p>{place.detail}</p>
              <nav className={styles.pickActions} aria-label={place.name + " links"}>
                <a
                  className={styles.pickLink}
                  href={place.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={place.linkLabel + ": " + place.name + " (opens a new tab)"}
                >
                  {place.linkLabel} <span aria-hidden="true">↗</span>
                </a>
                <a
                  className={styles.pickDirections}
                  href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(place.mapsQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={"Find " + place.name + " on Google Maps (opens a new tab)"}
                >
                  Directions <span aria-hidden="true">↗</span>
                </a>
              </nav>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
