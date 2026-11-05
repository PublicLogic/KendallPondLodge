'use client';
import {useActionState} from 'react';
import type {StoreProduct,StoreOrder} from '@/lib/mercantile-runtime';
import {addStoreItem,updateStoreItem,adjustStoreStock,fulfillStoreOrder,type StoreActionState} from './actions';
const initial:StoreActionState={ok:false,message:''};
function Notice({result}:{result:StoreActionState}){return result.message?<p role="status" className={result.ok?'merc-ok':'merc-error'}>{result.message}</p>:null;}
function Button({pending,children}:{pending:boolean;children:React.ReactNode}){return <button className="merc-btn" disabled={pending}>{pending?'Saving…':children}</button>;}
function Add(){
 const [result,action,pending]=useActionState(addStoreItem,initial);
 return <details className="merc-add"><summary>+ Add item</summary>
   <form action={action} className="merc-form">
     <label>Product<input name="name" minLength={2} maxLength={100} placeholder="Firewood bundle" required/></label>
     <label>Description<input name="description" maxLength={500} placeholder="Ready for the firepit"/></label>
     <div className="merc-fields"><label>Price ($)<input name="price" inputMode="decimal" defaultValue="10.00" required/></label>
       <label>Opening stock<input name="quantity" type="number" min={0} max={1000000} defaultValue={0} required/></label></div>
     <p className="merc-note">Starts as a draft. Stock is saved in PuddleJumper.</p>
     <Button pending={pending}>Create</Button><Notice result={result}/>
   </form></details>;
}
function ProductRow({item}:{item:StoreProduct}){
 const [saved,save,changing]=useActionState(updateStoreItem,initial);
 const [adjusted,adjust,adjusting]=useActionState(adjustStoreStock,initial);
 return <details className="merc-item"><summary className="merc-item-head">
  <span><strong>{item.name}</strong><small>{item.published?'Live':'Draft'} · {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(item.price_cents/100)}</small></span>
  <span className="merc-qty"><strong>{item.on_hand}</strong><small>on shelf</small></span><span aria-hidden="true">⌄</span>
 </summary><div className="merc-detail">
  <form action={adjust} className="merc-form">
   <input type="hidden" name="id" value={item.id}/><input type="hidden" name="version" value={item.version}/>
   <p className="merc-subhead">Adjust stock</p>
   <div className="merc-fields"><label>Change (+ or −)<input name="delta" type="number" min={-1000000} max={1000000} defaultValue={1} required/></label>
   <label>Reason<select name="reason"><option value="restock">Restock</option><option value="count correction">Count correction</option><option value="damaged stock">Damaged stock</option><option value="manual pickup">Manual pickup</option></select></label></div>
   <Button pending={adjusting}>Record adjustment</Button><Notice result={adjusted}/>
  </form>
  <form action={save} className="merc-form merc-edit">
   <input type="hidden" name="id" value={item.id}/><input type="hidden" name="version" value={item.version}/>
   <p className="merc-subhead">Product</p>
   <label>Name<input name="name" minLength={2} maxLength={100} defaultValue={item.name} required/></label>
   <label>Description<input name="description" maxLength={500} defaultValue={item.description}/></label>
   <label>Price ($)<input name="price" inputMode="decimal" defaultValue={(item.price_cents/100).toFixed(2)} required/></label>
   <label className="merc-check"><input name="published" type="checkbox" defaultChecked={Boolean(item.published)}/> Available to guests</label>
   <Button pending={changing}>Save product</Button><Notice result={saved}/>
  </form>
 </div></details>;
}
function OrderRow({order,items}:{order:StoreOrder;items:StoreProduct[]}){
 const [result,action,pending]=useActionState(fulfillStoreOrder,initial);
 const name=items.find(item=>item.id===order.product_id)?.name??'Product';
 return <div className="merc-order"><div><strong>{name} × {order.quantity}</strong><small>{order.status.replaceAll('_',' ')} · {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(order.total_cents/100)}</small></div>
 {order.status==='paid'&&<form action={action}><input type="hidden" name="id" value={order.id}/><Button pending={pending}>Collected</Button><Notice result={result}/></form>}
 </div>;
}
export function MercantileOwner({items,orders}:{items:StoreProduct[];orders:StoreOrder[]}){
 return <div className="merc-columns">
  <section className="merc-panel"><div className="merc-heading"><h2>Products</h2><span>{items.length} items</span></div>
   {items.length===0&&<p className="merc-empty">Nothing on the shelf yet.</p>}
   {items.map(item=><ProductRow key={item.id} item={item}/>)}
   <Add/>
  </section>
  <section className="merc-panel"><div className="merc-heading"><h2>Orders</h2><span>{orders.filter(o=>o.status==='paid'||o.status==='needs_review').length} to review</span></div>
   {orders.length===0?<p className="merc-empty">Orders appear here after checkout.</p>:orders.slice(0,12).map(order=><OrderRow key={order.id} order={order} items={items}/>)}
   <a className="merc-link" href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer">Stripe payments ↗</a>
   <p className="merc-note">Payment exceptions need review. Only paid orders can be marked collected.</p>
  </section>
 </div>;
}
