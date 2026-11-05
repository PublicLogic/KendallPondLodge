import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {handleMercantileWebhook} from '../lib/mercantile-webhook.mjs';

const secret='whsec_store_fixture_123';
const env={STRIPE_SECRET_KEY:'sk_test_synthetic',STRIPE_WEBHOOK_SECRET:secret};
const orderId='a2bedc1e-a895-44b9-b1fa-d9a08f743772';
const sessionId='cs_test_1234567890abcdef';
function signed(type='checkout.session.completed', overrides={}){
  const payload={id:'evt_test_1',type,livemode:false,data:{object:{
    id:sessionId,object:'checkout.session',payment_status:'paid',currency:'usd',amount_total:2000,
    metadata:{stay_store_order_id:orderId},...overrides
  }}};
  const body=JSON.stringify(payload),timestamp=Math.floor(Date.now()/1000);
  const sig=createHmac('sha256',secret).update(timestamp+'.'+body).digest('hex');
  return {body,signature:'t='+timestamp+',v1='+sig};
}
test('signed paid Mercantile checkout reaches PJ exactly once per webhook attempt',async()=>{
  const seen=[];
  const event=signed();
  const result=await handleMercantileWebhook({...event,env,
    settle:async(id,session,amount)=>{seen.push({id,session,amount});return {status:'paid'};},
    expire:async()=>{throw new Error('wrong action');}});
  assert.equal(result.status,200);
  assert.deepEqual(seen,[{id:orderId,session:sessionId,amount:2000}]);
});
test('tampered signature cannot reach PJ; falls back to original booking verifier',async()=>{
  const event=signed();
  let called=false;
  const result=await handleMercantileWebhook({...event,signature:event.signature+'deadbeef',env,
    settle:async()=>{called=true;},expire:async()=>{called=true;}});
  assert.equal(result,null);assert.equal(called,false);
});
test('booking checkout events keep the original booking handler',async()=>{
  const event=signed('checkout.session.completed',{metadata:{booking_request_id:orderId}});
  const result=await handleMercantileWebhook({...event,env,settle:async()=>{},expire:async()=>{}});
  assert.equal(result,null);
});
test('live/test mismatch, ambiguous metadata and paid amount mismatch fail safely',async()=>{
  let called=false;
  const mismatch=await handleMercantileWebhook({...signed(),env:{...env,STRIPE_SECRET_KEY:'sk_live_synthetic'},
    settle:async()=>{called=true;},expire:async()=>{}});
  assert.equal(mismatch.status,400);assert.equal(called,false);
  const ambiguous=await handleMercantileWebhook({...signed('checkout.session.completed',
    {metadata:{stay_store_order_id:orderId,booking_request_id:orderId}}),env,settle:async()=>{},expire:async()=>{}});
  assert.equal(ambiguous.status,503);
  const needsReview=await handleMercantileWebhook({...signed(),env,settle:async()=>({status:'needs_review'}),expire:async()=>{}});
  assert.equal(needsReview.status,200);assert.equal(needsReview.outcome,'needs_review');
});
test('expired checkout releases PJ hold and unavailable PJ triggers Stripe retry',async()=>{
  const hits=[];
  const expired=await handleMercantileWebhook({...signed('checkout.session.expired'),env,
    settle:async()=>{},expire:async(id)=>{hits.push(id);return {status:'expired'};}});
  assert.equal(expired.status,200);assert.deepEqual(hits,[orderId]);
  const failed=await handleMercantileWebhook({...signed(),env,
    settle:async()=>{throw new Error('PJ unavailable');},expire:async()=>{}});
  assert.equal(failed.status,503);
});
