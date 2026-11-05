import type {Metadata} from 'next';
import Link from 'next/link';
import {requireKplOwner} from '@/lib/require-kpl-owner';
import {listProducts,listOrders,StoreRuntimeError,type StoreOrder,type StoreProduct} from '@/lib/mercantile-runtime';
import {BookingServiceError} from '@/lib/booking-db';
import {MercantileOwner} from './MercantileOwner';
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
   connectionHint=code==='not_configured'?'This preview has no usable PJ connection configuration.':
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
   <p className="merc-note" style={{marginTop:23}}>Owner access currently uses the Lodge's shared owner code. PJ records that credential's actions, not yet a distinct human identity. Payment and tax configuration must be cleared before live rollout.</p>
 </div></main>;
}