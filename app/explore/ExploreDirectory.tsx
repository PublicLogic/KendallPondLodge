"use client";

import { useState } from "react";
import { exploreCategories, explorePicks, type ExploreCategory } from "./guide-data";
import styles from "./explore.module.css";

type FilterId = "all" | ExploreCategory;

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
            <div className={styles.pickBody}>
              <p className={styles.pickCategory}>{place.location} <span>· {place.bestFor}</span></p>
              <h3>{place.name}</h3>
              <p>{place.detail}</p>
            </div>
            <a
              className={styles.pickLink}
              href={place.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={place.linkLabel + ": " + place.name + " (opens new tab)"}
            >
              {place.linkLabel} <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>
    </>
  );
}
