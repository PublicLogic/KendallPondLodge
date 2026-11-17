import type {Metadata} from 'next';
import Link from 'next/link';
import {requireKplOwner} from '@/lib/require-kpl-owner';
import {listProducts,listOrders,StoreRuntimeError,type StoreOrder,type StoreProduct} from '@/lib/mercantile-runtime';
import {BookingServiceError} from '@/lib/booking-db';
import {MercantileOwner} from './MercantileOwner';
import {mercantilePaymentLinks} from '@/lib/mercantile-payment-links.mjs';
import './mercantile.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Mercantile · Lodge owner',robots:{index:false,follow:false}};
export default async function OwnerStore(){
 await requireKplOwner('/owner/store');
 let items:StoreProduct[]=[],orders:StoreOrder[]=[],connected=false;
 let connectionHint='';
 try{[items,orders]=await Promise.all([listProducts('owner'),listOrders()]);connected=true;}
 catch(error){
   const status=error instanceof StoreRuntimeError||error instanceof BookingServiceError?error.status:0;
   const code=error instanceof StoreRuntimeError||error instanceof BookingServiceError?error.code:'unavailable';
   console.warn('Mercantile connection failed', {status,code});
   const configuredUrl=process.env.KPL_STORE_URL||'';
   const configuredKey=process.env.KPL_STORE_KEY||'';
   const validKey=configuredKey.length>=32&&configuredKey.length<=4096&&!/\s/.test(configuredKey);
   let validUrl=false;
   try{const u=new URL(configuredUrl);validUrl=u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname.replace(/\/+$/,'')==='/api/stayos/booking';}catch{}
   connectionHint=code==='not_configured'?(validUrl?(validKey?'The PJ connection could not initialize.':'The Preview PJ key is missing or has an invalid format (minimum 32 characters; no whitespace).'):'The Preview PJ URL is missing or invalid; it must end in /api/stayos/booking.'):
     status===401?'This preview\'s PJ property credential was rejected.':
     status===404?'The configured PJ backend does not expose the Mercantile route.':
     status===403?'The configured PJ backend denied store access.':
     status===503?'The PJ connection is unavailable.':
     'The configured PJ store could not complete an authenticated catalog read.';
 }
 return <main id="main-content" className="merc-page"><div className="merc-container">
   <Link className="merc-back" href="/owner">← Lodge dashboard</Link>
   <div className="merc-headline"><div><p className="merc-kicker">The Lodge at Kendall Pond</p><h1 className="merc-title">Mercantile.</h1>
   <p className="merc-intro">Products, quantities and orders. Everything else happens in PuddleJumper.</p></div>
   <Link href="/store">Guest storefront ↗</Link></div>
   {!connected?<div className="merc-notice" role="status"><strong>Runtime not connected</strong>
     <p>{connectionHint} Nothing is being saved to a local substitute. No stock or sales counts are claimed.</p><p style={{marginTop:8}}>Preview and production have separate PJ settings. The live Fly deployment does not automatically change this preview connection.</p></div>
   :<MercantileOwner items={items} orders={orders}/>}

   <section className="merc-panel" aria-labelledby="stripe-links-title" style={{marginTop:20}}>
     <div className="merc-heading"><h2 id="stripe-links-title">Live Stripe links</h2><span>{mercantilePaymentLinks.length} products</span></div>
     <p className="merc-note" style={{marginBottom:15}}>This is the existing payment-link catalog, separate from PJ orders and stock.
       A guest's Stripe Payment Link purchase does not automatically decrement PuddleJumper stock or appear in PJ orders.
       Check the Stripe payment and reconcile physical pickup manually until the governed checkout is released.</p>
     <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:10}}>
       {mercantilePaymentLinks.map(item=><div key={item.sku} style={{border:'1px solid #e1e6df',borderRadius:9,padding:'14px 15px'}}>
         <strong style={{display:'block',fontSize:14}}>{item.name}</strong>
         <span style={{display:'block',fontSize:12,color:'#64756b',marginTop:5}}>{item.sku} · {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(item.priceCents/100)}</span>
         {process.env.VERCEL_ENV==='production'
           ?<a href={item.stripeUrl} target="_blank" rel="noopener noreferrer" className="merc-link" style={{margin:'10px 0 0'}}>Open Stripe checkout ↗</a>
           :<span style={{display:'block',fontSize:12,color:'#64756b',marginTop:10}}>Live link disabled in Preview</span>}
       </div>)}
     </div>
     <a href="https://dashboard.stripe.com/payment_links" className="merc-link" target="_blank" rel="noopener noreferrer">Manage payment links in Stripe ↗</a>
   </section>
   <p className="merc-note" style={{marginTop:23}}>Owner access currently uses the Lodge's shared owner code. PJ records that credential's actions, not yet a distinct human identity. Payment and tax configuration must be cleared before live rollout.</p>
 </div></main>;
}