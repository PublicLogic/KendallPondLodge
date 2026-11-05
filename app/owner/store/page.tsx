import type {Metadata} from 'next';
import Link from 'next/link';
import {requireKplOwner} from '@/lib/require-kpl-owner';
import {catalog,type CatalogItem} from '@/lib/mercantile-runtime';
import {addStoreItem,updateStoreItem} from './actions';
export const metadata:Metadata={title:'Mercantile · Owner',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
const panel={background:'#fff',border:'1px solid #e0e4dd',borderRadius:14,padding:24} as const;
const input={width:'100%',border:'1px solid #cbd5cb',borderRadius:8,padding:'12px 14px',background:'#fff'} as const;
export default async function OwnerStore(){
 await requireKplOwner('/owner/store');
 let items:CatalogItem[]=[];let connected=false;
 try{items=await catalog('GET','/items');connected=true;}catch{}
 return <main id="main-content" style={{background:'#f7f6f2',minHeight:'100vh',padding:'clamp(24px,5vw,65px) 18px'}}>
 <div style={{maxWidth:980,margin:'auto'}}>
 <Link href="/owner" style={{fontSize:14,fontWeight:650}}>← Lodge dashboard</Link>
 <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:20,flexWrap:'wrap',margin:'36px 0 26px'}}>
 <div><p className="eyebrow">Kendall Pond · Owner</p><h1 style={{fontSize:'clamp(3rem,6vw,5rem)',margin:'12px 0'}}>Mercantile.</h1><p style={{color:'#657369'}}>Products, quantities and the shelf. Nothing more than you need.</p></div>
 <Link href="/store" className="button button-secondary">View storefront ↗</Link>
 </div>
 {!connected&&<section role="status" style={{...panel,marginBottom:20,background:'#fff5e9',borderColor:'#e4c99d'}}><strong>Store runtime not connected</strong><p style={{marginTop:6}}>The governed catalog is not deployed to the PuddleJumper service yet. Changes are disabled rather than saved only on this device. Firewood checkout remains available through Stripe.</p></section>}
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:18,alignItems:'start'}}>
 <section style={panel}><p className="eyebrow">Catalog</p><h2 style={{fontSize:'2rem',margin:'10px 0 22px'}}>On the shelf</h2>
 {connected&&items.length===0&&<p style={{color:'#647367'}}>No products yet. Add your first item alongside.</p>}
 {items.map(item=><form key={item.id} action={updateStoreItem} style={{borderTop:'1px solid #e3e8e2',padding:'19px 0',display:'grid',gap:12}}>
 <input type="hidden" name="id" value={item.id}/>
 <div style={{display:'flex',justifyContent:'space-between',gap:12}}><strong>{item.name}</strong><span>${(item.price_cents/100).toFixed(2)}</span></div>
 <p style={{color:'#6d796d',fontSize:13}}>{item.description||'No description'}</p>
 <label style={{display:'grid',gap:7,fontSize:13,fontWeight:650}}>Quantity on hand<input style={input} type="number" name="on_hand" min="0" max="1000000" defaultValue={item.on_hand} required/></label>
 <label style={{display:'flex',gap:10,alignItems:'center',fontSize:13}}><input type="checkbox" name="published" defaultChecked={Boolean(item.published)}/> Show in public catalog</label>
 <button className="button button-secondary" type="submit">Save changes</button>
 </form>)}
 </section>
 <section style={panel}><p className="eyebrow">Add an item</p><h2 style={{fontSize:'2rem',margin:'10px 0 20px'}}>Something new.</h2>
 <form action={addStoreItem} style={{display:'grid',gap:15}}>
 <label style={{display:'grid',gap:7,fontSize:13,fontWeight:650}}>Name<input style={input} name="name" placeholder="Firewood bundle" maxLength={100} minLength={2} required disabled={!connected}/></label>
 <label style={{display:'grid',gap:7,fontSize:13,fontWeight:650}}>Description<input style={input} name="description" placeholder="Ready for the firepit" maxLength={500} disabled={!connected}/></label>
 <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
 <label style={{display:'grid',gap:7,fontSize:13,fontWeight:650}}>Price ($)<input style={input} type="number" name="price_cents" min="0" max="10000000" placeholder="1000" required disabled={!connected}/><small style={{fontWeight:400,color:'#647367'}}>Enter cents: 1000 = $10</small></label>
 <label style={{display:'grid',gap:7,fontSize:13,fontWeight:650}}>Quantity<input style={input} type="number" name="on_hand" min="0" max="1000000" defaultValue="0" required disabled={!connected}/></label>
 </div>
 <button className="button button-primary" type="submit" disabled={!connected}>Add to catalog</button>
 </form>
 <p style={{fontSize:12,color:'#6d796d',marginTop:17}}>New items begin unpublished. Every edit is recorded in the PuddleJumper runtime.</p>
 </section>
 </div>
 <p style={{marginTop:25,fontSize:13,color:'#647367'}}>Firewood payments: <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer">Stripe sales ↗</a>. Inventory edits are audited, but Stripe payment links do not yet deduct stock automatically.</p>
 </div></main>;
}
