'use server';
import { revalidatePath } from 'next/cache';
import { requireKplOwner } from '@/lib/require-kpl-owner';
import { catalog } from '@/lib/mercantile-runtime';
function integer(raw:FormDataEntryValue|null,min:number,max:number){const v=String(raw??'');if(!/^\d+$/.test(v))throw new Error('Invalid number');const n=Number(v);if(!Number.isSafeInteger(n)||n<min||n>max)throw new Error('Invalid number');return n;}
export async function addStoreItem(form:FormData){
 await requireKplOwner('/owner/store');
 const name=String(form.get('name')??'').trim(),description=String(form.get('description')??'').trim();
 if(name.length<2||name.length>100||description.length>500)throw new Error('Invalid item');
 await catalog('POST','/items',{name,description,price_cents:integer(form.get('price_cents'),0,10000000),on_hand:integer(form.get('on_hand'),0,1000000)});
 revalidatePath('/owner/store');revalidatePath('/store');
}
export async function updateStoreItem(form:FormData){
 await requireKplOwner('/owner/store');
 const id=String(form.get('id')??'');
 if(!/^[0-9a-f-]{36}$/.test(id))throw new Error('Invalid item');
 await catalog('PATCH','/items/'+id,{on_hand:integer(form.get('on_hand'),0,1000000),published:form.get('published')==='on'});
 revalidatePath('/owner/store');revalidatePath('/store');
}
