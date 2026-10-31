"use client";

import { useMemo, useState } from "react";
import type { PjExplorePlace } from "./pjExplore";
import { exploreCategories, type ExploreCategory } from "./guide-data";
import styles from "./explore.module.css";

type FilterId = "all" | ExploreCategory;

function mapDocument(places: PjExplorePlace[], selectedSlug: string) {
  const payload = JSON.stringify(places.filter(p=>p.latitude!==null && p.longitude!==null).map(p => ({
    slug:p.slug, name:p.name, lat:p.latitude, lng:p.longitude,
    location:p.location, url:p.url
  }))).replace(/</g,"\\u003c");
  const chosen = JSON.stringify(selectedSlug).replace(/</g,"\\u003c");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <style>html,body,#map{margin:0;width:100%;height:100%;font-family:system-ui,sans-serif} .leaflet-popup-content{font:13px/1.45 system-ui,sans-serif} .leaflet-popup-content a{color:#24543a} .marker{display:grid;place-items:center;width:30px;height:30px;border:2px solid #fff;border-radius:50%;background:#255440;color:white;box-shadow:0 2px 9px #142d2170;font-weight:700}</style></head>
  <body><div id="map" role="application" aria-label="Map of all local destinations"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
  const places=${payload};const focus=${chosen};
  const map=L.map('map',{scrollWheelZoom:false}).setView([42.58,-71.97],10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap contributors'}).addTo(map);
  const points=[];
  places.forEach((p,i)=>{const pin=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:'<div class="marker">'+(i+1)+'</div>',iconSize:[30,30],iconAnchor:[15,15]})}).addTo(map);
    const el=document.createElement('div');const name=document.createElement('strong');name.textContent=p.name;el.appendChild(name);
    el.appendChild(document.createElement('br'));const loc=document.createElement('span');loc.textContent=p.location;el.appendChild(loc);
    pin.bindPopup(el);points.push(pin);if(p.slug===focus)pin.openPopup();
  });
  if(points.length){map.fitBounds(L.featureGroup(points).getBounds().pad(.16),{maxZoom:13});}
  </script></body></html>`;
}

export function ExploreDirectory({ places }: { places: PjExplorePlace[] }) {
  const [selected,setSelected]=useState<FilterId>("all");
  const [focusedSlug,setFocusedSlug]=useState<string | null>(null);
  const visible=selected==="all"?places:places.filter(p=>p.category===selected);
  const focused=visible.find(p=>p.slug===focusedSlug)??null;
  const mapped=visible.filter(p=>p.latitude!==null && p.longitude!==null);
  const mapSrc=useMemo(()=>mapDocument(visible,focused?.slug??""),[visible,focused?.slug]);

  if(!places.length) return <div className={styles.eventEmpty}>Local recommendations are being prepared. Check back for the published guide.</div>;

  return <>
    <div className={styles.filters} role="group" aria-label="Filter local recommendations">
      {exploreCategories.map(option=><button key={option.id} type="button" aria-pressed={selected===option.id} onClick={()=>{setSelected(option.id);setFocusedSlug(null);}}>
        {option.label} <span>{option.id==="all"?places.length:places.filter(p=>p.category===option.id).length}</span>
      </button>)}
    </div>
    <section className={styles.mapSection} aria-label="Map of local destinations">
      <div className={styles.mapHeader}><div><span className={styles.mapKicker}>Around the Lodge</span><h3>Find your next stop.</h3></div><span className={styles.mapHelp}>{mapped.length} verified map pins · {visible.length} places.</span></div>
      <div className={styles.mapLayout}>
        <div className={styles.mapList} role="group" aria-label="Destinations">
          {visible.map(place=><button type="button" key={place.slug} aria-pressed={focused?.slug===place.slug} onClick={()=>setFocusedSlug(place.slug)}>
            <span><strong>{place.name}</strong><small>{place.location} · {place.bestFor}</small></span><span aria-hidden="true">↗</span>
          </button>)}
        </div>
        <div className={styles.mapCanvas}>
          {mapped.length ? <iframe title="Map of all local recommendations" srcDoc={mapSrc} sandbox="allow-scripts" loading="lazy" referrerPolicy="no-referrer" /> : <div className={styles.mapPending}>Map pins will appear as locations are verified and published through PuddleJumper.</div>}
          <div className={styles.mapFooter}><span><strong>{focused?.name??"All local stops"}</strong><small>{focused?.location??"Select a place for directions"}</small></span>
            {focused && focused.latitude !== null && focused.longitude !== null && <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(focused.latitude+","+focused.longitude)}`} target="_blank" rel="noopener noreferrer">Directions ↗</a>}
          </div>
        </div>
      </div>
    </section>
    <div className={styles.directory} id="explore-picks">
      {visible.map(place=><a className={styles.photoPick} key={place.slug} href={place.url} target="_blank" rel="noopener noreferrer">
        <div className={styles.photoPickMedia} style={place.photoUrl?{backgroundImage:`url("${place.photoUrl}")`}:undefined}>
          {!place.photoUrl&&<span className={styles.photoPickPlaceholder}>{place.bestFor||"Explore"}</span>}
        </div>
        <div className={styles.photoPickDetails}><span className={styles.photoPickLocation}>{place.location} · {place.bestFor}</span><h3>{place.name}</h3><span className={styles.photoPickArrow} aria-hidden="true">↗</span></div>
      </a>)}
    </div>
  </>;
}
