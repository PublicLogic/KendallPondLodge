// Store checkout events share KPL's existing signed Stripe endpoint, not its booking ledger.
import {verifyPaymentSignature} from './kpl-booking-core.mjs';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESSION=/^cs_(test|live)_[A-Za-z0-9]{8,200}$/;
const respond=(status,code)=>({status,body:status===200?{received:true}:{error:code}});
export async function handleMercantileWebhook({body,signature,env,settle,expire}){
  if(!verifyPaymentSignature(body,signature,env.STRIPE_WEBHOOK_SECRET))return null;
  let event;
  try{event=JSON.parse(body);}catch{return null;}
  const data=event?.data?.object,meta=data?.metadata,orderId=meta?.stay_store_order_id;
  if(!orderId)return null; // existing booking handler remains authoritative for bookings
  if(meta.booking_request_id||meta.kpl_booking_id)return respond(503,'reconciliation_required');
  if(!UUID.test(orderId))return respond(503,'reconciliation_required');
  if(!['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired'].includes(event.type))return respond(200);
  const live=/^(sk|rk)_live_/.test(env.STRIPE_SECRET_KEY??'');
  const test=/^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY??'');
  if(!(live||test)||typeof event.livemode!=='boolean'||event.livemode!==live
    ||data?.object!=='checkout.session'||!SESSION.test(data.id)||data.id.startsWith('cs_live_')!==live)
    return respond(400,'mode_mismatch');
  try{
    if(event.type==='checkout.session.expired'){
      await expire(orderId);
      return respond(200);
    }
    if(data.payment_status!=='paid')return respond(200);
    if(data.currency!=='usd'||!Number.isSafeInteger(data.amount_total)||data.amount_total<1)
      return respond(503,'reconciliation_required');
    const outcome=await settle(orderId,data.id,data.amount_total);
    if(outcome.status==='needs_review')return {...respond(200),outcome:'needs_review'};
    if(outcome.status==='paid'||outcome.status==='fulfilled')return {...respond(200),outcome:'paid'};
    return respond(503,'reconciliation_required');
  }catch{
    // Stripe retries failed deliveries. Never acknowledge a payment PJ did not record.
    return respond(503,'store_unavailable');
  }
}
