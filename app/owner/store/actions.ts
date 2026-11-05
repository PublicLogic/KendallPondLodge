'use server';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { requireKplOwner } from '@/lib/require-kpl-owner';
import { catalog,StoreRuntimeError,type StoreProduct,type StoreOrder } from '@/lib/mercantile-runtime';

export type StoreActionState={ok:boolean;message:string};
const invalid=(message:string):StoreActionState=>({ok:false,message});
const success=(message:string):StoreActionState=>({ok:true,message});
function cents(value:FormDataEntryValue|null){
  const s=String(value??'').trim();
  if(!/^(?:0|[1-9]\d{0,5})(?:\.\d{1,2})?$/.test(s))throw new Error('Enter a dollar amount such as 10.00.');
  const [whole,fraction='']=s.split('.');
  const total=Number(whole)*100+Number(fraction.padEnd(2,'0'));
  if(!Number.isSafeInteger(total)||total>10000000)throw new Error('Price is outside the allowed range.');
  return total;
}
function integer(value:FormDataEntryValue|null,min:number,max:number){
  const s=String(value??'').trim();
  if(!/^-?\d{1,7}$/.test(s))throw new Error('Enter a whole number.');
  const n=Number(s);
  if(!Number.isSafeInteger(n)||n<min||n>max)throw new Error('Quantity is outside the allowed range.');
  return n;
}
function uuid(value:FormDataEntryValue|null){
  const id=String(value??'');
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw new Error('Invalid product.');
  return id;
}
function safeText(value:FormDataEntryValue|null,min:number,max:number){
  const s=String(value??'').trim();
  if(s.length<min||s.length>max)throw new Error('Please check the item name or description.');
  return s;
}
function done(){
  revalidatePath('/owner/store');
  revalidatePath('/store');
}
function errorMessage(e:unknown){
  if(e instanceof StoreRuntimeError){
    if(e.code==='stale_product')return 'This item changed elsewhere. Refresh and try again.';
    if(e.code==='invalid_stock')return 'That adjustment would leave invalid stock.';
    if(e.code==='duplicate_sku')return 'This item already exists.';
    return 'The store could not save that change. No local copy was substituted.';
  }
  return e instanceof Error&&e.message.length<=120?e.message:'Unable to save.';
}
export async function addStoreItem(_previous:StoreActionState,form:FormData):Promise<StoreActionState>{
  await requireKplOwner('/owner/store');
  try{
    const name=safeText(form.get('name'),2,100);
    const description=safeText(form.get('description'),0,500);
    const price_cents=cents(form.get('price'));
    const initial_stock=integer(form.get('quantity'),0,1000000);
    const sku=name.toLowerCase()==='firewood bundle'?'KPL-WOOD-001':
      'KPL-'+name.toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,18)+'-'+randomUUID().slice(0,6).toUpperCase();
    await catalog<StoreProduct>('POST','/items','owner',{sku,name,description,price_cents,initial_stock});
    done();return success('Item added as a draft. Publish when it is ready.');
  }catch(e){return invalid(errorMessage(e));}
}
export async function updateStoreItem(_previous:StoreActionState,form:FormData):Promise<StoreActionState>{
  await requireKplOwner('/owner/store');
  try{
    const id=uuid(form.get('id'));
    const name=safeText(form.get('name'),2,100);
    const description=safeText(form.get('description'),0,500);
    const price_cents=cents(form.get('price'));
    const expected_version=integer(form.get('version'),1,100000000);
    await catalog<StoreProduct>('PATCH','/items/'+id,'owner',{
      name,description,price_cents,expected_version,published:form.get('published')==='on'
    });
    done();return success('Product saved to PuddleJumper.');
  }catch(e){return invalid(errorMessage(e));}
}
export async function adjustStoreStock(_previous:StoreActionState,form:FormData):Promise<StoreActionState>{
  await requireKplOwner('/owner/store');
  try{
    const id=uuid(form.get('id')),delta=integer(form.get('delta'),-1000000,1000000);
    if(delta===0)throw new Error('Choose a positive or negative stock adjustment.');
    const reason=safeText(form.get('reason'),3,160);
    const expected_version=integer(form.get('version'),1,100000000);
    await catalog<StoreProduct>('POST','/items/'+id+'/stock','owner',{delta,reason,expected_version});
    done();return success('Stock adjustment recorded in PJ.');
  }catch(e){return invalid(errorMessage(e));}
}
export async function fulfillStoreOrder(_previous:StoreActionState,form:FormData):Promise<StoreActionState>{
  await requireKplOwner('/owner/store');
  try{
    const id=uuid(form.get('id'));
    const order=await catalog<StoreOrder>('POST','/orders/'+id+'/fulfill','owner',{});
    done();return success(order.status==='fulfilled'?'Order marked collected.':'Order updated.');
  }catch(e){return invalid(errorMessage(e));}
}
