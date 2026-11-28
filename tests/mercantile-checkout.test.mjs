import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareMercantileCheckout} from '../lib/mercantile-checkout.mjs';
const order={id:'c703c597-f598-41a9-88af-b9aab6100c54',receipt_token:'9531018b-c1ec-4ca7-ab55-78426f57bf9b',status:'reserved',price_cents:1000,quantity:2,total_cents:2000,created_at:'2026-11-17T14:00:00Z',reserved_until:'2026-11-17T15:10:00Z',stripe_session_id:null};
const session={id:'cs_test_retryboundary0001',url:'https://checkout.stripe.com/c/pay/test',status:'open'};
const defaults={order,origin:'https://lodge.example',live:false,now:Date.parse(order.created_at),stripe:async()=>session,attach:async(id,s)=>({id,stripe_session_id:s,status:'checkout'})};
test('retries after a lost attachment keep the Stripe key and every request parameter stable',async()=>{
 const calls=[];let fail=true,created=0,memo;
 const stripe=async(path,body,key)=>{const fingerprint=body.toString();calls.push({path,key,body:fingerprint});if(memo)assert.equal(fingerprint,memo);else{memo=fingerprint;created++;}return session;};
 const attach=async(id,s)=>{if(fail){fail=false;throw Error('response lost');}return{id,stripe_session_id:s,status:'checkout'};};
 await assert.rejects(prepareMercantileCheckout({...defaults,stripe,attach}));
 assert.equal(await prepareMercantileCheckout({...defaults,stripe,attach,now:defaults.now+120000}),session.url);
 assert.equal(created,1);assert.deepEqual(calls[0],calls[1]);
});
test('an attached checkout is retrieved and reused instead of created again',async()=>{
 const calls=[];const url=await prepareMercantileCheckout({...defaults,order:{...order,status:'checkout',stripe_session_id:session.id},stripe:async(...args)=>{calls.push(args);return session;},attach:async()=>assert.fail('must not attach twice')});
 assert.equal(url,session.url);assert.deepEqual(calls,[['checkout/sessions/'+session.id]]);
});
test('paid PJ order goes to the receipt without calling Stripe',async()=>{
 const url=await prepareMercantileCheckout({...defaults,order:{...order,status:'paid'},stripe:async()=>assert.fail('already paid')});assert.match(url,/\/store\/receipt\//);
});
test('completed Stripe checkout goes to a PJ receipt without asserting payment itself',async()=>{
 const url=await prepareMercantileCheckout({...defaults,order:{...order,status:'checkout',stripe_session_id:session.id},stripe:async()=>({...session,status:'complete'})});assert.match(url,/\/store\/receipt\//);
});
test('expired and review-held orders cannot start checkout',async()=>{
 for(const status of ['expired','needs_review'])await assert.rejects(prepareMercantileCheckout({...defaults,order:{...order,status}}));
 await assert.rejects(prepareMercantileCheckout({...defaults,now:Date.parse(order.reserved_until)}));
});
test('wrong mode and untrusted redirect hosts are rejected before attaching',async()=>{
 const attach=async()=>assert.fail('must not attach');
 await assert.rejects(prepareMercantileCheckout({...defaults,live:true,attach}));
 await assert.rejects(prepareMercantileCheckout({...defaults,stripe:async()=>({...session,url:'https://attacker.example/pay'}),attach}));
});
test('an ambiguous attachment is not represented as checkout success',async()=>{
 await assert.rejects(prepareMercantileCheckout({...defaults,attach:async()=>({status:'paid'})}));
});
test('retrieved mismatched or expired sessions fail without creation or attachment',async()=>{
 for(const response of [{...session,id:'cs_test_different0001'},{...session,status:'expired'}]) {
  await assert.rejects(prepareMercantileCheckout({...defaults,order:{...order,status:'checkout',stripe_session_id:session.id},
   stripe:async(path,body)=>{assert.equal(body,undefined);return response;},attach:async()=>assert.fail('must not attach')}));
 }
});
test('invalid persisted expiry and invalid origin fail before provider interactions',async()=>{
 const stripe=async()=>assert.fail('no Stripe call');
 for(const created_at of ['invalid','2026-11-17T14:20:00Z'])await assert.rejects(prepareMercantileCheckout({...defaults,order:{...order,created_at},stripe}));
 await assert.rejects(prepareMercantileCheckout({...defaults,origin:'http://lodge.example',stripe}));
});
