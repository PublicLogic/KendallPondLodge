"use client";

import { useState } from "react";
import { exploreCategories, explorePicks, type ExploreCategory } from "./guide-data";
import styles from "./explore.module.css";

type FilterId = "all" | ExploreCategory;

// Published, venue-specific photos. Missing images stay as clean editorial tiles,
// never as unrelated Lodge photos or misrepresented stock imagery.
const venuePhotos: Record<string, string> = {
  "blue-moon-diner": "https://img1.wsimg.com/isteam/ip/9216a751-4145-4c1d-8237-13388cce2d2f/1%20Blue%20Moon%20Diner%20today.jpg",
  "cafe-edesia": "https://www.localcoffeeshops.org/static/img/shop/massachusetts-gardner-edesia-cafe.jpeg",
  "gardner-ale-house": "https://thevendry.com/cdn-cgi/image/height%3D1920%2Cwidth%3D1920%2Cfit%3Dcontain%2Cmetadata%3Dnone/https%3A/s3.us-east-1.amazonaws.com/uploads.thevendry.co/36210/1724159981450_Gardner-Ale-House-Dining-Room.jpg",
  "sawa": "https://s.yimg.com/ny/api/res/1.2/6TUPFKjlbHPBjtuXPUFuag--/YXBwaWQ9aGlnaGxhbmRlcjt3PTI0MDA7aD0xODAwO2NmPXdlYnA-/https%3A/media.zenfs.com/en/the-gardner-news/0571e096c8cead0dc8fef4a9edafefe3",
  "dunn-state-park": "https://www.mass.gov/files/styles/embedded_half_width/public/images/2025-05/35021_dunn_boat_access_1_1_small.jpg?itok=OKn985QD",
  "red-apple-farm": "https://images.squarespace-cdn.com/content/v1/6750ca6b3bccca5a0d530520/5a474557-c647-4fa7-8ee2-428559557029/Storefront1.jpg",
  "wachusett-reservation": "https://d2exd72xrrp1s7.cloudfront.net/www/000/1k5/zf/zfbpm9vabfgf1832uiw7dcsf63wj9s5d5-uhi40986880/0?crop=true&height=576&width=768",
};

export function ExploreDirectory() {
  const [selected, setSelected] = useState<FilterId>("all");
  const [mapPlace, setMapPlace] = useState(explorePicks[0].slug);
  const visible = selected === "all"
    ? explorePicks
    : explorePicks.filter((place) => place.category === selected);

  const focused = explorePicks.find((place) => place.slug === mapPlace) ?? explorePicks[0];

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
      <section className={styles.mapSection} aria-label="Interactive local map">
        <div className={styles.mapHeader}>
          <div><span className={styles.mapKicker}>Around the Lodge</span><h3>Find your next stop.</h3></div>
          <span className={styles.mapHelp}>Choose any spot to explore the map.</span>
        </div>
        <div className={styles.mapLayout}>
          <div className={styles.mapList} role="group" aria-label="Choose a destination on the map">
            {visible.map((place) => (
              <button key={place.slug} type="button" aria-pressed={focused.slug === place.slug}
                onClick={() => setMapPlace(place.slug)}>
                <span><strong>{place.name}</strong><small>{place.location} · {place.bestFor}</small></span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <div className={styles.mapCanvas}>
            <iframe
              key={focused.slug}
              title={`Map showing ${focused.name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(focused.address ?? focused.name + ", Massachusetts")}&output=embed`}
              loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className={styles.mapFooter}>
              <span><strong>{focused.name}</strong><small>{focused.location}</small></span>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(focused.address ?? focused.name + ", Massachusetts")}`} target="_blank" rel="noopener noreferrer">Directions ↗</a>
            </div>
          </div>
        </div>
      </section>
      <div className={styles.directory} id="explore-picks">
        {visible.map((place) => (
          <a className={styles.photoPick} key={place.slug} href={place.url}
            target="_blank" rel="noopener noreferrer"
            aria-label={place.name + " — " + place.location + " (opens new tab)"}>
            <div className={styles.photoPickMedia}
              style={venuePhotos[place.slug] ? { backgroundImage: `url("${venuePhotos[place.slug]}")` } : undefined}
              role="img" aria-label={venuePhotos[place.slug] ? "Photo of " + place.name : "No venue photo available"}>
              {!venuePhotos[place.slug] && <span className={styles.photoPickPlaceholder}>{place.category === "food" ? "Eat local" : place.category === "outside" ? "Get outside" : place.category === "rain" ? "Take it inside" : "In season"}</span>}
            </div>
            <div className={styles.photoPickDetails}>
              <span className={styles.photoPickLocation}>{place.location} · {place.bestFor}</span>
              <h3>{place.name}</h3>
              <span className={styles.photoPickArrow} aria-hidden="true">↗</span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
