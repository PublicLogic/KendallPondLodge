import 'server-only';
import { bookingClient } from './booking-db';
export type CatalogItem={id:string;name:string;description:string;price_cents:number;on_hand:number;published:number;updated_at:string};
export async function catalog(method:'GET'|'POST'|'PATCH',path:string,body?:unknown):Promise<any>{
 const client=bookingClient();
 const base=client.base.replace('/api/stayos/booking','/api/stayos/store');
 const response=await fetch(base+path,{method,headers:{Authorization:'Bearer '+client.key,'Content-Type':'application/json',...(method==='GET'?{}:{'X-PuddleJumper-Request':'true'})},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(10000)});
 const payload=await response.json();
 if(!response.ok||payload?.success!==true)throw new Error('Store runtime unavailable');
 return payload.data;
}
