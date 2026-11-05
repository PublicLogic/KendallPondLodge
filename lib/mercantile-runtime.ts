import 'server-only';
import {bookingClient} from './booking-db';

export type StoreProduct={
  id:string;sku:string;name:string;description:string;price_cents:number;
  on_hand:number;published:number;version:number;updated_at:string;
};
export type StoreOrder={
  id:string;product_id:string;request_key:string;receipt_token:string;
  quantity:number;price_cents:number;total_cents:number;
  status:'reserved'|'checkout'|'paid'|'fulfilled'|'expired'|'needs_review';
  reserved_until:string;stripe_session_id:string|null;
  paid_at:string|null;fulfilled_at:string|null;review_reason:string|null;
};
export type StoreRole='owner'|'guest'|'webhook';
export class StoreRuntimeError extends Error{
  constructor(public status:number,public code:string){super('The store could not complete this request.');}
}
const allowed=/^\/(?:items(?:\/public|\/[0-9a-f-]{36}(?:\/stock)?)?|orders(?:\/receipt\/[0-9a-f-]{36}|\/[0-9a-f-]{36}(?:\/checkout|\/payment|\/expire|\/fulfill)?)?)$/;
export async function catalog<T>(method:'GET'|'POST'|'PATCH',path:string,role:StoreRole,body?:unknown):Promise<T>{
  if(!allowed.test(path)||path.includes('..'))throw new StoreRuntimeError(400,'invalid_path');
  const client=bookingClient(); // existing server-only property-scoped bearer
  const origin=client.base.replace(/\/api\/stayos\/booking$/,'');
  const response=await fetch(origin+'/api/stayos/store'+path,{
    method,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000),
    headers:{Authorization:'Bearer '+client.key,'Content-Type':'application/json',
      'X-PJ-Mercantile-Role':role,
      ...(role==='owner'?{'X-PJ-Actor-Ref':'kpl:owner-code'}:{}),
      ...(method==='GET'?{}:{'X-PuddleJumper-Request':'true'})},
    ...(body===undefined?{}:{body:JSON.stringify(body)})
  }).catch(()=>{throw new StoreRuntimeError(503,'service_unavailable');});
  let data:{success?:boolean;error?:string;data?:T};
  try{data=await response.json();}catch{throw new StoreRuntimeError(503,'invalid_response');}
  if(!response.ok||data.success!==true){
    const error=typeof data.error==='string'&&/^[a-z_]{2,60}$/.test(data.error)?data.error:'store_unavailable';
    throw new StoreRuntimeError(response.status,error);
  }
  return data.data as T;
}
export const listProducts=(role:'owner'|'guest'='guest')=>catalog<StoreProduct[]>('GET',role==='owner'?'/items':'/items/public',role);
export const listOrders=()=>catalog<StoreOrder[]>('GET','/orders','owner');
