import { PjBookingClient } from '../lib/pj-booking-client.mjs';
const client = new PjBookingClient({baseUrl:process.env.KPL_STORE_URL??'',key:process.env.KPL_STORE_KEY??'',timeoutMs:10000});
const rows=await client.list(100);
const target=rows.filter(x=>x.guest_email==='staging-booking@publiclogic.org'&&x.check_in==='2026-11-03'&&x.check_out==='2026-11-05');
if(target.length!==1)throw new Error('Expected exactly one staging rehearsal request');
const booking=target[0];
if(booking.status!=='requested'&&booking.status!=='quoted')throw new Error('Unexpected booking state '+booking.status);
if(booking.status==='requested'){
 await client.issueQuote(booking.id,{
 nightly_cents:16900,cleaning_cents:5000,pet_cents:0,tax_cents:0,other_cents:0,other_label:null,
 deposit_cents:10000,total_cents:38800,
 cancellation_terms:'Staging-only quote. No real reservation, refund or guest commitment.',
 balance_terms:'Staging-only deposit $100 and balance $288; no live payment is authorized.',
 quote_expires:new Date(Date.now()+3*24*60*60*1000).toISOString()
 });
}
const after=await client.get(booking.id);
if(after?.status!=='quoted'||after.total_cents!==38800||after.deposit_cents!==10000)throw new Error('Quote state or arithmetic mismatch');
console.log('PASS: itemized staging quote recorded; 2 nights x $169 + $50 cleaning = $388');
let blocked=false;
try{await client.beginCheckout(after.quote_token);}
catch(e){if(e.code==='calendar_conflict')blocked=true;else throw new Error('Unexpected checkout error '+e.code);}
if(!blocked)throw new Error('FAIL: checkout was not blocked without Airbnb owner block');
const final=await client.get(booking.id);
if(final.status!=='quoted'||final.stripe_session_id)throw new Error('FAIL: payment state mutated despite missing block');
const msg=await client.messageStatus();
if(msg.readiness.enabled!==false)throw new Error('FAIL: messaging enabled');
console.log('PASS: checkout blocked without Airbnb owner block');
console.log('PASS: no Stripe session attached, no confirmation, messaging disabled');
