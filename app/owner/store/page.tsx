import type {Metadata} from "next";
import Link from "next/link";
import {requireKplOwner} from "@/lib/require-kpl-owner";
import StockWorksheet from "./StockWorksheet";
export const metadata:Metadata={title:"Mercantile · Owner",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
const upcoming=[["Local honey & maple","Supplier and food-retail review"],["Coffee & cocoa","Supplier and food-retail review"],["Homegoods & gifts","Source and pricing pending"]];
export default async function OwnerStore(){
 await requireKplOwner("/owner/store");
 return <main id="main-content" style={{background:"#f5f0e8",minHeight:"100vh",padding:"clamp(24px,5vw,60px) 18px"}}>
 <div style={{maxWidth:1080,margin:"auto"}}>
 <Link href="/owner" style={{fontSize:14,fontWeight:700}}>← Owner dashboard</Link>
 <p className="eyebrow" style={{marginTop:28}}>Lodge at Kendall Pond · Owner</p>
 <h1 style={{fontSize:"clamp(3rem,6vw,5rem)",margin:"12px 0"}}>The Mercantile.</h1>
 <p style={{color:"var(--muted)",maxWidth:660,lineHeight:1.65}}>A small store to run alongside direct booking. Review firewood, check sales and keep track of what’s on the shelf.</p>
 <div style={{display:"flex",flexWrap:"wrap",gap:12,margin:"25px 0 30px"}}>
  <Link href="/owner/bookings" className="button button-secondary">Direct bookings</Link>
  <Link href="/store" className="button button-primary">View guest storefront</Link>
  <a className="button button-secondary" href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer">Stripe sales ↗</a>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:20,alignItems:"start"}}>
 <StockWorksheet/>
 <div style={{display:"grid",gap:18}}>
  <section style={{background:"#fff",border:"1px solid var(--line)",borderRadius:14,padding:25}}>
   <p className="eyebrow">Available product</p><h2 style={{fontSize:"2rem",margin:"10px 0"}}>🪵 Firewood bundle</h2>
   <p style={{fontSize:30,fontWeight:750}}>$10 <span style={{fontSize:13,fontWeight:400}}>per bundle</span></p>
   <p style={{color:"var(--muted)",marginTop:12}}>SKU KPL-WOOD-001 · Stripe-hosted checkout · 1–10 bundles · Guest pickup</p>
   <a href="https://dashboard.stripe.com/payment_links" target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:18,fontWeight:700}}>Manage Stripe checkout ↗</a>
  </section>
  <section style={{background:"#fff",border:"1px solid var(--line)",borderRadius:14,padding:25}}>
   <p className="eyebrow">Catalog pipeline</p><h2 style={{fontSize:"1.9rem",margin:"10px 0 16px"}}>Coming soon</h2>
   {upcoming.map(([name,detail])=><div key={name} style={{padding:"12px 0",borderTop:"1px solid var(--line)"}}><strong>{name}</strong><p style={{fontSize:13,color:"var(--muted)",marginTop:4}}>{detail}</p></div>)}
   <p style={{fontSize:12,color:"var(--muted)",marginTop:14}}>These products are not for sale yet. Publishing and supplier editing will require the shared store backend.</p>
  </section>
 </div></div>
 <p style={{fontSize:13,lineHeight:1.65,color:"#657568",marginTop:24}}>Payments are real in Stripe. The stock worksheet is saved only in this browser and does not change availability or prevent overselling. Confirm tax treatment and pickup location before distributing the QR code.</p>
 </div></main>;
}