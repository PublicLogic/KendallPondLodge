import 'server-only';
import { BookingServiceError } from './pj-booking-client.mjs';
export async function stripeRequest<T=Record<string,unknown>>(path:string,fields?:URLSearchParams,idempotencyKey?:string):Promise<T>{
 const key=process.env.STRIPE_SECRET_KEY;
 if(!key||!/^(sk|rk)_(test|live)_/.test(key))throw new BookingServiceError(503,'not_configured');
 if(!/^checkout\/sessions(?:\/cs_(?:test|live)_[A-Za-z0-9]+(?:\/expire)?)?$/.test(path))throw new BookingServiceError(400,'invalid_route');
 let response:Response;
 try{response=await fetch(`https://api.stripe.com/v1/${path}`,{method:fields?'POST':'GET',headers:{Authorization:`Bearer ${key}`,...(fields?{'Content-Type':'application/x-www-form-urlencoded'}:{}),...(idempotencyKey?{'Idempotency-Key':idempotencyKey}:{})},body:fields?.toString(),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(12000)})}
 catch{throw new BookingServiceError(503,'payment_unavailable')}
 if(!response.ok)throw new BookingServiceError(503,'payment_unavailable');
 return response.json() as Promise<T>;
}
