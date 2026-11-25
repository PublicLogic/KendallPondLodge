"use client";

import { useState } from "react";
import { exploreCategories, explorePicks, type ExploreCategory } from "./guide-data";
import type { PjExplorePlace } from "./pjExplore";
import guidePoints from "./guide-points.json";
import styles from "./explore.module.css";

type Point = { lat: number; lng: number };
type Category = "all" | ExploreCategory;
const points: Record<string, Point> = guidePoints;
const curatedPhotos = (slug: string) => "/images/explore/" + slug + ".webp";
const maps = {
  area: { west: -72.19, east: -71.75, north: 42.72, south: 42.46 },
  gardner: { west: -72.03, east: -71.960, north: 42.593, south: 42.551 },
};
function contains(point: Point | null, bounds: typeof maps.area) {
  return point && point.lng >= bounds.west && point.lng <= bounds.east &&
    point.lat >= bounds.south && point.lat <= bounds.north;
}

export function ExploreDirectory({ places: published }: { places: PjExplorePlace[] }) {
  const [category,setCategory] = useState<Category>("all");
  const [selection, select] = useState("");
  const [zoom, setZoom] = useState<keyof typeof maps>("area");
  const places = [
    ...explorePicks.map(p => ({
      ...p, point: points[p.slug], photo: curatedPhotos(p.slug), address: p.address ?? p.name + ", " + p.location + ", MA",
    })),
    ...published.filter(p => !explorePicks.some(c => c.slug === p.slug)).map(p => ({
      ...p, detail: p.bestFor, photo: p.photoUrl, address: p.name + ", " + p.location + ", MA",
      point: p.latitude !== null && p.longitude !== null ? { lat: p.latitude, lng: p.longitude } : null,
    })),
  ];
  const visible = places.filter(p => category === "all" || p.category === category);
  const selected = visible.find(p => p.slug === selection) ?? visible[0];
  const bounds = maps[zoom];
  function choose(p: typeof places[number]) {
    select(p.slug);
    setZoom(contains(p.point, maps.gardner) ? "gardner" : "area");
  }
  return <>
    <div className={styles.filters} role="group" aria-label="Filter local recommendations">
      {exploreCategories.map(f => <button key={f.id} type="button" aria-pressed={category===f.id}
        onClick={() => { setCategory(f.id); select(""); setZoom("area"); }}>{f.label}</button>)}
    </div>
    <section className={styles.mapSection} aria-label="Map of local recommendations">
      <div className={styles.mapHeader}><h3>Out from Kendall Pond</h3>
        <div className={styles.mapModes} role="group" aria-label="Map scale">
          {(["area","gardner"] as const).map(mode => <button key={mode} type="button"
            aria-pressed={mode === zoom} onClick={() => setZoom(mode)}>{mode === "area" ? "Whole area" : "Gardner close-up"}</button>)}
        </div>
      </div>
      <div className={styles.atlas}>
        <div className={styles.chart} style={{backgroundImage: "url(/images/explore/" + zoom + ".webp)"}}>
          {visible.map((p,i) => p.point && contains(p.point,bounds) &&
            <button type="button" key={p.slug} className={styles.mapDot} aria-label={"Select " + p.name}
              aria-pressed={p.slug === selected?.slug} onClick={() => choose(p)}
              style={{left: 100*(p.point.lng-bounds.west)/(bounds.east-bounds.west)+"%",
                top: 100*(bounds.north-p.point.lat)/(bounds.north-bounds.south)+"%"}}>{i+1}</button>)}
          <small className={styles.mapLegend}>USGS · The National Map</small>
        </div>
        {selected && <div className={styles.stop} aria-live="polite">
          <small>{selected.location} · {selected.bestFor}</small><h3>{selected.name}</h3><p>{selected.detail}</p>
          <a href={"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(selected.address)} target="_blank" rel="noopener noreferrer">Get directions ↗</a>
        </div>}
      </div>
      <div className={styles.mapList} aria-label="Choose a map stop">{visible.map((p,i) =>
        <button type="button" key={p.slug} aria-pressed={p.slug === selected?.slug} onClick={() => choose(p)}>
          <strong>{i+1}. {p.name}</strong></button>)}</div>
    </section>
    <div className={styles.directory} id="explore-picks">{visible.map(p =>
      <a className={styles.photoPick} href={p.url} key={p.slug} target="_blank" rel="noopener noreferrer">
        {p.photo && <div className={styles.photoPickMedia} style={{backgroundImage:"url("+JSON.stringify(p.photo)+")"}} />}
        <div className={styles.photoPickDetails}><span className={styles.photoPickLocation}>{p.location} · {p.bestFor}</span>
          <h3>{p.name}</h3><p>{p.detail}</p><span className={styles.photoPickArrow} aria-hidden="true">↗</span></div>
      </a>)}</div>
  </>;
}
