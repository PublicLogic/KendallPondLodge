"use client";

import { useEffect, useMemo, useState } from "react";
import { exploreCategories, explorePicks, type ExploreCategory } from "./guide-data";
import type { PjExplorePlace } from "./pjExplore";
import styles from "./explore.module.css";

type Category = "all" | ExploreCategory;
type Point = { slug:string; lat:number; lng:number };
const curatedPhotos: Record<string,string> = {
  "blue-moon-diner":"https://img1.wsimg.com/isteam/ip/9216a751-4145-4c1d-8237-13388cce2d2f/1%20Blue%20Moon%20Diner%20today.jpg",
  "gardner-ale-house":"https://thevendry.com/cdn-cgi/image/height%3D1920%2Cwidth%3D1920%2Cfit%3Dcontain%2Cmetadata%3Dnone/https%3A/s3.us-east-1.amazonaws.com/uploads.thevendry.co/36210/1724159981450_Gardner-Ale-House-Dining-Room.jpg",
  "red-apple-farm":"https://images.squarespace-cdn.com/content/v1/6750ca6b3bccca5a0d530520/5a474557-c647-4fa7-8ee2-428559557029/Storefront1.jpg",
  "dunn-state-park":"https://www.mass.gov/files/styles/embedded_half_width/public/images/2025-05/35021_dunn_boat_access_1_1_small.jpg?itok=OKn985QD",
  "wachusett-reservation":"https://d2exd72xrrp1s7.cloudfront.net/www/000/1k5/zf/zfbpm9vabfgf1832uiw7dcsf63wj9s5d5-uhi40986880/0?crop=true&height=576&width=768"
};
type Place = {slug:string;name:string;category:ExploreCategory;location:string;bestFor:string;url:string;address:string;photoUrl:string|null};
const curated:Place[]=explorePicks.map(p=>({...p,address:p.address??p.name+", "+p.location+", Massachusetts",photoUrl:curatedPhotos[p.slug]??null}));

function mapHtml(places:Place[],points:Point[],selected:string) {
  const data=JSON.stringify(points.flatMap(p=>{const item=places.find(x=>x.slug===p.slug);return item?[{...p,name:item.name,location:item.location}]:[]})).replace(/</g,"\\u003c");
  const chosen=JSON.stringify(selected).replace(/</g,"\\u003c");
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{height:100%;width:100%;padding:0;margin:0}.dot{width:28px;height:28px;display:grid;place-items:center;background:#214c39;color:white;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 10px #203d3150;font:700 12px system-ui}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>const data=${data};const chosen=${chosen};const map=L.map("map",{scrollWheelZoom:false}).setView([42.58,-71.98],10);L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",{maxZoom:18,attribution:"Tiles © Esri — Esri, HERE, USGS, TomTom and other contributors"}).addTo(map);const markers=[];data.forEach((p,i)=>{const marker=L.marker([p.lat,p.lng],{icon:L.divIcon({className:"",html:'<span class="dot">'+(i+1)+'</span>',iconSize:[32,32],iconAnchor:[16,16]})}).addTo(map);const node=document.createElement("div");const b=document.createElement("strong");b.textContent=p.name;node.append(b);node.append(document.createElement("br"));node.append(document.createTextNode(p.location));marker.bindPopup(node);if(p.slug===chosen)marker.openPopup();markers.push(marker)});if(markers.length)map.fitBounds(L.featureGroup(markers).getBounds().pad(.16),{maxZoom:13});</script></body></html>`;
}

export function ExploreDirectory({ places: pjPlaces }: { places:PjExplorePlace[] }) {
  const [category,setCategory]=useState<Category>("all");
  const [selected,setSelected]=useState<string>("");
  const [points,setPoints]=useState<Point[]>([]);
  const [lookupDone,setLookupDone]=useState(false);
  const places=useMemo(()=>{
    const additions=pjPlaces.filter(p=>p.latitude!==null&&p.longitude!==null&&!curated.some(c=>c.slug===p.slug)).map(p=>({...p,address:p.name+", "+p.location+", Massachusetts",photoUrl:p.photoUrl}));
    return [...curated,...additions];
  },[pjPlaces]);
  useEffect(()=>{
    let canceled=false;
    const initial=pjPlaces.filter(p=>p.latitude!==null&&p.longitude!==null).map(p=>({slug:p.slug,lat:p.latitude!,lng:p.longitude!}));
    setPoints(initial);
    (async()=>{
      const found=[...initial];
      for(const place of curated) {
        if(canceled) return;
        if(found.some(p=>p.slug===place.slug))continue;
        try{
          const response=await fetch("https://photon.komoot.io/api/?limit=3&q="+encodeURIComponent(place.address),{signal:AbortSignal.timeout(6000)});
          if(!response.ok)continue;
          const data=await response.json();
          const feature=(data.features??[]).find((x:{geometry?:{coordinates?:number[]};properties?:{state?:string}})=>x.properties?.state==="Massachusetts"&&Array.isArray(x.geometry?.coordinates));
          if(feature){
            const [lng,lat]=feature.geometry.coordinates;
            if(lat>=42&&lat<=43.5&&lng>=-73.5&&lng<=-70.5){found.push({slug:place.slug,lat,lng});if(!canceled)setPoints([...found]);}
          }
        }catch{}
      }
      if(!canceled)setLookupDone(true);
    })();
    return ()=>{canceled=true;};
  },[pjPlaces]);
  const visible=places.filter(p=>category==="all"||p.category===category);
  const visiblePoints=points.filter(p=>visible.some(v=>v.slug===p.slug));
  const chosen=visible.find(p=>p.slug===selected);
  const map=useMemo(()=>mapHtml(visible,visiblePoints,selected),[visible,visiblePoints,selected]);
  return <>
    <div className={styles.filters} role="group" aria-label="Filter local recommendations">{exploreCategories.map(f=><button type="button" key={f.id} aria-pressed={category===f.id} onClick={()=>{setCategory(f.id);setSelected("");}}>{f.label} <span>{f.id==="all"?places.length:places.filter(p=>p.category===f.id).length}</span></button>)}</div>
    <section className={styles.mapSection} aria-label="Map of local recommendations">
      <div className={styles.mapHeader}><div><span className={styles.mapKicker}>Around the Lodge</span><h3>Find your next stop.</h3></div><span className={styles.mapHelp}>{visiblePoints.length} locations on the map{!lookupDone?" · locating more…":""}</span></div>
      <div className={styles.mapLayout}>
        <div className={styles.mapList}>{visible.map(p=><button type="button" key={p.slug} aria-pressed={selected===p.slug} onClick={()=>setSelected(p.slug)}><span><strong>{p.name}</strong><small>{p.location} · {p.bestFor}</small></span><span aria-hidden="true">↗</span></button>)}</div>
        <div className={styles.mapCanvas}>{visiblePoints.length?<iframe title="All local destinations on one map" srcDoc={map} sandbox="allow-scripts" loading="lazy" referrerPolicy="no-referrer"/>:<div className={styles.mapPending}>{lookupDone?"Open a destination below for directions.":"Locating the best nearby stops…"}</div>}
          <div className={styles.mapFooter}><span><strong>{chosen?.name??"The neighborhood"}</strong><small>{chosen?.location??"Food, farms, trails & more"}</small></span>{chosen&&<a href={"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(chosen.address)} target="_blank" rel="noopener noreferrer">Directions ↗</a>}</div>
        </div>
      </div>
    </section>
    <div className={styles.directory} id="explore-picks">{visible.map(p=><a className={styles.photoPick} href={p.url} key={p.slug} target="_blank" rel="noopener noreferrer"><div className={styles.photoPickMedia} style={p.photoUrl?{backgroundImage:"url("+JSON.stringify(p.photoUrl)+")"}:undefined}>{!p.photoUrl&&<span className={styles.photoPickPlaceholder}>{p.bestFor}</span>}</div><div className={styles.photoPickDetails}><span className={styles.photoPickLocation}>{p.location} · {p.bestFor}</span><h3>{p.name}</h3><span className={styles.photoPickArrow} aria-hidden="true">↗</span></div></a>)}</div>
  </>;
}
