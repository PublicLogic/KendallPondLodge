import type { Metadata } from "next";
import Link from "next/link";
import {catalog,type CatalogItem} from "@/lib/mercantile-runtime";
export const metadata:Metadata={title:"The Mercantile · Kendall Pond Lodge",description:"Firewood for your stay and a few local favorites coming soon."};
const checkout="https://pay.publiclogic.org/b/fZudRa4hU6Bv31f9SRgYU03";
const coming=[{name:"Local honey & maple",icon:"🍯",description:"Something sweet from our neighbors."},{name:"Coffee & cocoa",icon:"☕",description:"A warm cup for a quiet morning."},{name:"Homegoods & gifts",icon:"🧶",description:"A little something to take home."}];
export const dynamic="force-dynamic";
export default async function StorePage(){
 let catalogItems:CatalogItem[]=[];
 try{catalogItems=(await catalog("GET","/items")).filter((item:CatalogItem)=>Boolean(item.published));}catch{}
 return <main id="main-content" style={{background:"#f5f0e8",padding:"clamp(24px,5vw,70px) 18px 80px",minHeight:"80vh"}}>
 <div style={{maxWidth:1060,margin:"auto"}}>
 <p style={{fontSize:12,letterSpacing:".16em",fontWeight:750,color:"#526c55",textTransform:"uppercase"}}>The Lodge at Kendall Pond · Guest shop</p>
 <h1 style={{fontSize:"clamp(3.2rem,7vw,6rem)",margin:"15px 0 24px",color:"#243b2e",maxWidth:840}}>The little shop at the Lodge.</h1>
 <p style={{fontSize:"clamp(1rem,2vw,1.25rem)",lineHeight:1.65,maxWidth:620,color:"#56665a"}}>A few useful things for your stay, and a few good things from around here. We’re starting with firewood. More is on its way.</p>
 <div style={{marginTop:38,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",background:"#fff",border:"1px solid #dedfd5",borderRadius:16,overflow:"hidden"}}>
 <div style={{background:"linear-gradient(140deg,#d3dfd0,#e6d7be)",minHeight:320,display:"grid",placeItems:"center"}} aria-hidden="true"><span style={{fontSize:110}}>🪵</span></div>
 <div style={{padding:"clamp(24px,4vw,48px)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
 <p style={{color:"#54745c",fontSize:12,letterSpacing:".12em",textTransform:"uppercase",fontWeight:800}}>Available to order</p>
 <h2 style={{fontSize:"clamp(2.3rem,4vw,3.4rem)",margin:"14px 0"}}>Firewood bundles</h2>
 <p style={{lineHeight:1.65,color:"#5c6c61"}}>One bundle for the firepit. Choose how many you need at secure checkout and pick them up here at the Lodge.</p>
 <p style={{margin:"22px 0",fontSize:30,fontWeight:750,color:"#233c2d"}}>$10 <span style={{fontSize:14,fontWeight:400}}>per bundle</span></p>
 <a href={checkout} style={{display:"block",background:"#2d4c3a",color:"white",padding:"17px 22px",textAlign:"center",borderRadius:9,fontWeight:750,textDecoration:"none"}}>Buy firewood securely ↗</a>
 <p style={{marginTop:13,fontSize:12,color:"#677469"}}>Stripe checkout · 1–10 bundles · Pickup only</p>
 </div></div>
 {catalogItems.filter(item=>item.name.toLowerCase()!=="firewood bundle").length>0&&<section style={{marginTop:40}}><h2 style={{fontSize:"2rem",marginBottom:18}}>On the shelf</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>{catalogItems.filter(item=>item.name.toLowerCase()!=="firewood bundle").map(item=><article key={item.id} style={{background:"#fff",padding:24,borderRadius:12,border:"1px solid #e0e1d8"}}><h3>{item.name}</h3><p style={{color:"#637063",marginTop:8}}>{item.description}</p><strong style={{display:"block",marginTop:14}}>${(item.price_cents/100).toFixed(2)}</strong><p style={{fontSize:13,marginTop:8,color:"#637063"}}>{item.on_hand>0?"Available at the Lodge — ask your host":"Currently out of stock"}</p></article>)}</div></section>}
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:15,flexWrap:"wrap",margin:"66px 0 22px"}}><div><p style={{fontSize:12,fontWeight:750,color:"#54745c",letterSpacing:".12em",textTransform:"uppercase"}}>Coming soon</p><h2 style={{fontSize:"clamp(2.2rem,4vw,3.5rem)",marginTop:10}}>More good things.</h2></div><span style={{color:"#667568",fontSize:14}}>Not available to purchase yet</span></div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
 {coming.map(item=><article key={item.name} style={{background:"#fff",border:"1px solid #e0e1d8",borderRadius:12,overflow:"hidden"}}>
 <div style={{background:"#e5e9de",height:135,display:"grid",placeItems:"center",fontSize:62}} aria-hidden="true">{item.icon}</div>
 <div style={{padding:22}}><p style={{fontSize:11,letterSpacing:".1em",fontWeight:750,color:"#73806e"}}>COMING SOON</p><h3 style={{fontSize:"1.4rem",margin:"10px 0"}}>{item.name}</h3><p style={{fontSize:14,lineHeight:1.6,color:"#5b6b60"}}>{item.description}</p></div></article>)}
 </div>
 <section style={{background:"#e7e9df",borderRadius:12,marginTop:42,padding:"clamp(24px,4vw,38px)"}}><h2 style={{fontSize:"clamp(1.8rem,3vw,2.5rem)"}}>How it works</h2><p style={{marginTop:12,maxWidth:750,lineHeight:1.75,color:"#516353"}}>Pick what you need, pay securely on your phone, and keep your confirmation. Ask us where to collect your bundles before taking them. We’ll add more items as they become available.</p></section>
 <p style={{marginTop:30,fontSize:14,color:"#627264"}}>Need anything else? Message us through your reservation. <Link href="/guidebook">Back to the guest guidebook</Link>.</p>
 </div></main>;
}