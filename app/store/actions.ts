'use server';
import {redirect} from 'next/navigation';
import {catalog,type StoreOrder} from '@/lib/mercantile-runtime';
import {stripeRequest} from '@/lib/booking-stripe';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESS=/^cs_(test|live)_[A-Za-z0-9]{8,200}$/;
function liveStoreCheckoutEnabled(){
  return process.env.KPL_STAY_COMMERCE_ENABLED==='true';
}
function returnOrigin(){
  const preview=process.env.VERCEL_ENV==='preview';
  const raw=preview&&process.env.VERCEL_URL?'https://'+process.env.VERCEL_URL:process.env.KPL_BOOKING_ORIGIN;
  const u=new URL(raw??'');
  if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw new Error('Invalid store return origin');
  return u.origin;
}
export async function startStoreCheckout(form:FormData):Promise<never>{
 if(!liveStoreCheckoutEnabled())redirect('/store?error=paused');
 const id=String(form.get('product_id')??'');
 const key=String(form.get('request_key')??'');
 const quantity=Number(form.get('quantity'));
 if(!UUID.test(id)||!UUID.test(key)||!Number.isSafeInteger(quantity)||quantity<1||quantity>10)redirect('/store?error=invalid');
 const secret=process.env.STRIPE_SECRET_KEY??'';
 const live=/^(sk|rk)_live_/.test(secret),test=/^(sk|rk)_test_/.test(secret);
 if(!(live||test))redirect('/store?error=payment');
 // Never run live payments from a preview build, or test payments from the public release.
 if(process.env.VERCEL_ENV==='preview'&&live)redirect('/store?error=payment');
 if(process.env.VERCEL_ENV==='production'&&test)redirect('/store?error=payment');
 let location:string;
 try{
   const order=await catalog<StoreOrder>('POST','/orders','guest',{product_id:id,quantity,request_key:key});
   const origin=returnOrigin();
   const expiry=Math.floor(Date.now()/1000)+3600;
   const fields=new URLSearchParams({
     mode:'payment','payment_method_types[0]':'card',
     'line_items[0][price_data][currency]':'usd',
     'line_items[0][price_data][unit_amount]':String(order.price_cents),
     'line_items[0][price_data][product_data][name]':'Lodge Mercantile item',
     'line_items[0][quantity]':String(order.quantity),
     'metadata[stay_store_order_id]':order.id,
     'payment_intent_data[metadata][stay_store_order_id]':order.id,
     success_url:origin+'/store/receipt/'+order.receipt_token,
     cancel_url:origin+'/store?canceled=1',
     expires_at:String(expiry)
   });
   const session=await stripeRequest<{id:string;url:string}>('checkout/sessions',fields,'stay-mercantile-'+order.id);
   if(!SESS.test(session.id)||session.id.startsWith('cs_live_')!==live)throw new Error('Checkout mode mismatch');
   const u=new URL(session.url);
   if(u.protocol!=='https:'||!['checkout.stripe.com','pay.publiclogic.org'].includes(u.hostname)||u.username||u.password||u.port)throw new Error('Invalid checkout URL');
   await catalog<StoreOrder>('POST','/orders/'+order.id+'/checkout','guest',{stripe_session_id:session.id});
   location=u.href;
 }catch{
   // No false success; a held order is released by Stripe expiry or PJ's lazy expiration.
   redirect('/store?error=unavailable');
 }
 redirect(location);
}
