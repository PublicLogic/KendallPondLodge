'use server';
import {redirect} from 'next/navigation';
import {catalog,type StoreOrder} from '@/lib/mercantile-runtime';
import {stripeRequest} from '@/lib/booking-stripe';
import {prepareMercantileCheckout} from '@/lib/mercantile-checkout.mjs';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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
   location=await prepareMercantileCheckout({
     order,origin:returnOrigin(),live,stripe:stripeRequest,
     attach:(orderId:string,sessionId:string)=>catalog<StoreOrder>('POST','/orders/'+orderId+'/checkout','guest',{stripe_session_id:sessionId})
   });
 }catch{
   // No false success; a held order is released by Stripe expiry or PJ's lazy expiration.
   redirect('/store?error=unavailable');
 }
 redirect(location);
}
