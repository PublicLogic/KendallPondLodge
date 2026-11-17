import type {Metadata} from "next";
import {randomUUID} from "node:crypto";
import Link from "next/link";
import {listProducts,liveStoreCheckoutEnabled,type StoreProduct} from "@/lib/mercantile-runtime";
import {startStoreCheckout} from "./actions";
import Shopfront from "./Shopfront";
import styles from "./mercantile.module.css";

export const metadata:Metadata={
 title:"The Lodge Shop | Lodge at Kendall Pond",
 description:"Firewood, handmade gifts and a few snacks, ready for pickup at the Lodge at Kendall Pond in Gardner, MA.",
 alternates:{canonical:"/store"}
};
export const dynamic="force-dynamic";

const money=(cents:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);

export default async function StorePage({searchParams}:{searchParams:Promise<{error?:string;canceled?:string}>}){
 const {error,canceled}=await searchParams;
 const commerce=liveStoreCheckoutEnabled();
 let items:StoreProduct[]=[];
 let connected=false;
 if(commerce){try{items=await listProducts("guest");connected=true;}catch{}}

 // The manual Stripe links are production-only and never render next to PJ checkout.
 const checkoutEnabled = !commerce && process.env.VERCEL_ENV === "production";

 return <main id="main-content" className={styles.page} data-mercantile-editorial data-guest-shop>
   <header className={styles.shopIntro}>
     <div>
       <p className={styles.kicker}>LODGE AT KENDALL POND</p>
       <h1>The Lodge Shop</h1>
       <p>Firewood, handmade goods, and snacks. Pick what you need, pay on your phone, and collect it here at the Lodge.</p>
     </div>
     <span className={styles.introNote}>Guest self-serve · On-site pickup</span>
   </header>

   {commerce ? <section className={styles.pjCatalog} aria-labelledby="governed-store-title">
     <div className={styles.sectionInner}>
       <span className={styles.kicker}>LODGE STORE</span>
       <h2 id="governed-store-title">On the shelf.</h2>
       <p className={styles.pjIntro}>Published items are checked against current stock by the Lodge store runtime.
         Payment is handled by Stripe. Pickup is confirmed only after payment is verified.</p>
       {error && <p className={styles.pjError} role="alert">Checkout could not be started. No payment was confirmed.</p>}
       {canceled && <p className={styles.pjError} role="status">Checkout was canceled. No purchase was confirmed.</p>}
       {!connected ? <p className={styles.pjError} role="status">The Lodge store is temporarily unavailable. No purchases can be started until it reconnects.</p>
         : items.length===0 ? <p className={styles.pjIntro}>Nothing is published for purchase right now. Ask us if you need a hand.</p>
         : <div className={styles.pjItems}>
             {items.map(item=><article key={item.id} className={styles.pjItem}>
               <div><h3>{item.name}</h3><p>{item.description}</p><small>{item.on_hand} available</small></div>
               <strong>{money(item.price_cents)}</strong>
               {item.on_hand>0 ? <form action={startStoreCheckout} className={styles.pjForm}>
                 <input type="hidden" name="product_id" value={item.id}/>
                 <input type="hidden" name="request_key" value={randomUUID()}/>
                 <label>Quantity <input name="quantity" type="number" min={1} max={Math.min(item.on_hand,10)} defaultValue={1} required/></label>
                 <button type="submit">Pay securely <span aria-hidden="true">↗</span></button>
               </form> : <span>Out of stock</span>}
             </article>)}
           </div>}
     </div>
   </section>
   : <>
       {!checkoutEnabled && <p className={styles.previewNotice} role="status"><strong>Store preview.</strong> Products and prices are real; checkout is disabled here.</p>}
       <Shopfront checkoutEnabled={checkoutEnabled}/>
     </>}

   <footer className={styles.shopFooter}>
     <div><span className={styles.kicker}>NATE &amp; ALLIE</span>
       <h2>Need something?</h2>
       <p>We live nearby. Send a message through your reservation if the shelf is missing something you need.</p></div>
     <Link href="/guidebook">Back to the Lodge guide <span aria-hidden="true">↗</span></Link>
   </footer>
 </main>;
}
