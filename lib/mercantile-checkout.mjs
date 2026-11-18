// Server-side checkout coordination. PJ owns order state; Stripe owns payment.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESSION=/^cs_(test|live)_[A-Za-z0-9]{8,200}$/;
export class MercantileCheckoutError extends Error {
  constructor(code){super('The store checkout could not be completed.');this.code=code;}
}
export async function prepareMercantileCheckout({order,origin,live,stripe,attach,now=Date.now()}) {
  const fail=code=>{throw new MercantileCheckoutError(code);};
  let base;try{base=new URL(origin);}catch{fail('invalid_origin');}
  if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash||base.pathname!=='/')fail('invalid_origin');
  if(!order||!UUID.test(order.id)||!UUID.test(order.receipt_token)||
    !Number.isSafeInteger(order.price_cents)||order.price_cents<1||
    !Number.isSafeInteger(order.quantity)||order.quantity<1||order.quantity>10||
    order.total_cents!==order.price_cents*order.quantity)fail('invalid_order');
  if(!Number.isFinite(now)||!Number.isFinite(Date.parse(order.reserved_until)))fail('invalid_order');
  const receipt=base.origin+'/store/receipt/'+order.receipt_token;
  if(order.status==='paid'||order.status==='fulfilled')return receipt;
  if(!['reserved','checkout'].includes(order.status)||Date.parse(order.reserved_until)<=now)fail('order_not_open');
  let session;
  if(order.stripe_session_id){
    if(!SESSION.test(order.stripe_session_id))fail('invalid_session');
    session=await stripe('checkout/sessions/'+encodeURIComponent(order.stripe_session_id));
    if(session?.id!==order.stripe_session_id)fail('session_mismatch');
    if(session.id.startsWith('cs_live_')!==live)fail('mode_mismatch');
    if(session.status==='complete'||session.payment_status==='paid')return receipt;
    if(session.status!=='open')fail('checkout_closed');
  }else{
    // Every parameter under this idempotency key must remain byte-for-byte
    // stable on retry, including after a response or attachment is lost.
    const created=Date.parse(order.created_at),hold=Date.parse(order.reserved_until);
    const expiry=Math.floor(created/1000)+3600;
    if(!Number.isFinite(created)||!Number.isFinite(hold)||!Number.isFinite(now)||
      expiry*1000>hold||expiry*1000<=now)fail('checkout_closed');
    const fields=new URLSearchParams({mode:'payment','payment_method_types[0]':'card',
      'line_items[0][price_data][currency]':'usd',
      'line_items[0][price_data][unit_amount]':String(order.price_cents),
      'line_items[0][price_data][product_data][name]':'Lodge Mercantile item',
      'line_items[0][quantity]':String(order.quantity),
      'metadata[stay_store_order_id]':order.id,
      'payment_intent_data[metadata][stay_store_order_id]':order.id,
      success_url:receipt,cancel_url:base.origin+'/store?canceled=1',expires_at:String(expiry)});
    session=await stripe('checkout/sessions',fields,'stay-mercantile-'+order.id);
  }
  if(!SESSION.test(session?.id??'')||session.id.startsWith('cs_live_')!==live)fail('mode_mismatch');
  let url;try{url=new URL(session.url);}catch{fail('invalid_checkout_url');}
  if(url.protocol!=='https:'||!['checkout.stripe.com','pay.publiclogic.org'].includes(url.hostname)||url.username||url.password||url.port)fail('invalid_checkout_url');
  if(!order.stripe_session_id){
    const attached=await attach(order.id,session.id);
    if(attached?.id!==order.id||attached.stripe_session_id!==session.id||attached.status!=='checkout')fail('attachment_unverified');
  }
  return url.href;
}
