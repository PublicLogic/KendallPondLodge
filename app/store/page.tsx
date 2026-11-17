import type {Metadata} from "next";
import {randomUUID} from "node:crypto";
import Image from "next/image";
import Link from "next/link";
import {lodgePhoto} from "@/app/_data/lodge-photos";
import {listProducts,liveStoreCheckoutEnabled,type StoreProduct} from "@/lib/mercantile-runtime";
import {startStoreCheckout} from "./actions";
import {VendingMachine} from "./VendingMachine";
import styles from "./mercantile.module.css";

export const metadata:Metadata={
  title:"The Little Machine | Lodge at Kendall Pond",
  description:"Meet the Little Machine: a digital vending-style Mercantile for firewood, handmade treasures and snacks at the Lodge at Kendall Pond.",
  alternates:{canonical:"/store"},
};
export const dynamic="force-dynamic";

const scene=lodgePhoto(47);
const usd=(cents:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);

export default async function StorePage({searchParams}:{searchParams:Promise<{error?:string;canceled?:string}>}){
 const {error,canceled}=await searchParams;
 const commerce=liveStoreCheckoutEnabled();
 let items:StoreProduct[]=[];
 let connected=false;
 if(commerce){try{items=await listProducts("guest");connected=true;}catch{}}
 // Preview never exposes live Payment Link actions; PJ checkout is separately feature gated.
 const checkoutEnabled = !commerce && process.env.VERCEL_ENV === "production";

 return <main id="main-content" className={styles.page} data-mercantile-editorial data-vending-experience>
   <section className={styles.vendHero} aria-labelledby="mercantile-title">
     <Image src={scene.src} alt={scene.alt} fill priority sizes="100vw"
       className={styles.vendHeroImage}/>
     <div className={styles.vendHeroShade} aria-hidden="true"/>
     <div className={styles.vendHeroInside}>
       <p className={styles.vendOverline}>THE LODGE AT KENDALL POND <span>GARDNER, MA</span></p>
       <div className={styles.vendHeroStory}>
         <p className={styles.vendKicker}>WELCOME TO THE KPL MICRO-MERCANTILE</p>
         <h1 id="mercantile-title">The Little<br/><em>Machine.</em></h1>
         <p>For one more fire by the pond, a midnight snack, or a handmade something to take home.
           Eleven good little things. One very fun way to choose.</p>
         <a className={styles.vendHeroAction} href="#machine">TRY THE MACHINE <span aria-hidden="true">↓</span></a>
       </div>
       <p className={styles.vendHeroFoot}>DIGITAL MACHINE / REAL LODGE SHELVES <span>NO. 001</span></p>
     </div>
   </section>

   {commerce ? <section className={styles.pjCatalog} aria-labelledby="governed-store-title">
      <div className={styles.sectionInner}>
       <p className={styles.eyebrow}>PuddleJumper STAY Commerce</p>
       <h2 id="governed-store-title">The Lodge shelf.</h2>
       <p className={styles.pjIntro}>Published items are checked against current stock by the Lodge store runtime.
          Pay through Stripe; a receipt only confirms an order after the payment is verified.</p>
       {error && <p className={styles.pjError} role="alert">Checkout could not be started. No payment was confirmed.</p>}
       {canceled && <p className={styles.pjError} role="status">Checkout was canceled. No purchase was confirmed.</p>}
       {!connected ? <p className={styles.pjError} role="status">The connected Lodge store is temporarily unavailable. No orders can be placed until it reconnects.</p>
         : items.length===0 ? <p className={styles.pjIntro}>Nothing is published for purchase right now. Ask us if you need a hand.</p>
         : <ul className={styles.rows}>
             {items.map(item=><li key={item.id} className={styles.productRow}>
               <div className={styles.productCopy}>
                 <h3>{item.name}</h3><p>{item.description}</p>
                 <small className={styles.pjStock}>{item.on_hand} currently in stock</small>
               </div>
               <strong className={styles.productPrice}>{usd(item.price_cents)}</strong>
               {item.on_hand>0 ? <form action={startStoreCheckout} className={styles.pjForm}>
                 <input type="hidden" name="product_id" value={item.id}/>
                 <input type="hidden" name="request_key" value={randomUUID()}/>
                 <label>Qty <input name="quantity" type="number" min={1} max={Math.min(item.on_hand,10)} defaultValue={1} required/></label>
                 <button className={styles.checkout} type="submit">Pay securely ↗</button>
               </form> : <span className={styles.checkoutDisabled}>Out of stock</span>}
             </li>)}
           </ul>}
      </div>
     </section> :
     <>
       {!checkoutEnabled && <p className={styles.vendPreview} role="status">
         <strong>Store preview.</strong> Explore all 11 slots; real payments are disabled here.
       </p>}
       <VendingMachine checkoutEnabled={checkoutEnabled}/>
     </>}

   <section className={styles.vendClosing} aria-label="About the Lodge Mercantile">
     <div>
       <p>KPL / FROM NATE &amp; ALLIE</p>
       <h2>Little conveniences.<br/><em>Big pond energy.</em></h2>
       <span>Need something else? We live close by. Just send a message through your reservation.</span>
     </div>
     <Link href="/guidebook">Back to the Lodge guide <span aria-hidden="true">↗</span></Link>
   </section>
 </main>;
}
