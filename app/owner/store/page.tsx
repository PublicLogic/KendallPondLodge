import type { Metadata } from "next";
import Link from "next/link";
import { requireKplOwner } from "@/lib/require-kpl-owner";
export const metadata:Metadata={title:"Mercantile · Firewood",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function OwnerStore(){
 await requireKplOwner("/owner/store");
 return <main id="main-content" style={{maxWidth:900,margin:"auto",padding:"clamp(32px,6vw,75px) 20px"}}>
  <p className="eyebrow">Lodge at Kendall Pond · Owner</p>
  <h1 style={{fontSize:"clamp(3rem,6vw,5rem)",margin:"15px 0"}}>Mercantile.</h1>
  <p style={{maxWidth:650,color:"var(--muted)",lineHeight:1.7}}>The first product is firewood bundles at $10. Stripe handles checkout and payment records. Stock is counted on the shelf for this first version—no pretend live inventory.</p>
  <div style={{display:"flex",flexWrap:"wrap",gap:12,margin:"28px 0"}}>
   <Link href="/store" className="button button-primary">Open guest store</Link>
   <a href="https://dashboard.stripe.com/payment_links" target="_blank" rel="noopener noreferrer" className="button button-secondary">Stripe payment links ↗</a>
   <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer" className="button button-secondary">Paid orders ↗</a>
  </div>
  <section style={{border:"1px solid var(--line)",background:"white",borderRadius:12,padding:24}}>
   <h2 style={{fontSize:"2rem"}}>Firewood bundle · $10</h2>
   <p style={{marginTop:12}}>SKU: KPL-WOOD-001 · Stripe product and reusable payment link created.</p>
   <p style={{marginTop:12}}>Guests can choose 1–10 bundles. Confirm payment in Stripe before releasing bundles. The store does not automatically count remaining stock yet.</p>
   <p style={{marginTop:12,color:"var(--muted)"}}>For this pilot, record opening bundles, bundles added, and bundles collected in a simple daily count. Add a proper stock ledger only once this sells consistently.</p>
  </section>
  <p style={{marginTop:22,fontSize:14,color:"var(--muted)"}}>Before public launch, verify Massachusetts sales tax treatment and confirm the Stripe payment link's tax settings. The link currently has automatic tax disabled.</p>
  <p style={{marginTop:18}}><Link href="/owner">← Back to owner desk</Link></p>
 </main>;
}
