"use client";
import {useEffect,useState} from "react";
const KEY="kpl-mercantile-stock-draft-v1";
type Stock={opening:string;received:string;collected:string;note:string;updated:string};
const initial:Stock={opening:"",received:"",collected:"",note:"",updated:""};
export default function StockWorksheet(){
 const [stock,setStock]=useState<Stock>(initial);const [ready,setReady]=useState(false);const [saved,setSaved]=useState(false);
 useEffect(()=>{try{const raw=window.localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);setStock({...initial,...parsed});}}catch{}setReady(true)},[]);
 const valid=(v:string)=>v===""||(/^(0|[1-9]\d{0,5})$/.test(v));
 const count=(v:string)=>Number(v||0);
 const remaining=count(stock.opening)+count(stock.received)-count(stock.collected);
 function change(field:keyof Stock,value:string){if(field!=="note"&&!valid(value))return;setStock(prev=>({...prev,[field]:value,updated:""}));setSaved(false)}
 function save(){const next={...stock,updated:new Date().toISOString()};try{window.localStorage.setItem(KEY,JSON.stringify(next));setStock(next);setSaved(true)}catch{setSaved(false)}}
 return <section style={{background:"white",border:"1px solid var(--line)",borderRadius:14,padding:"clamp(20px,4vw,30px)"}}>
  <p className="eyebrow">Physical stock · Working worksheet</p>
  <h2 style={{fontSize:"clamp(1.8rem,3vw,2.6rem)",margin:"10px 0"}}>Firewood bundles</h2>
  <p style={{color:"var(--muted)",lineHeight:1.6}}>Record the opening count, what you add, and bundles you physically hand out. Save this count on this device.</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,margin:"22px 0"}}>
   {([["opening","Opening count"],["received","Added"],["collected","Collected"]] as const).map(([key,label])=><label key={key} style={{display:"grid",gap:8,fontWeight:700,fontSize:13}}>{label}<input inputMode="numeric" pattern="[0-9]*" aria-label={label} value={stock[key]} onChange={e=>change(key,e.target.value)} placeholder="0" style={{border:"1px solid #c6d2c6",borderRadius:8,padding:"13px",fontSize:22,width:"100%"}}/></label>)}
  </div>
  <div style={{background:"#e7ede5",borderRadius:10,padding:22,display:"flex",alignItems:"center",justifyContent:"space-between",gap:15,flexWrap:"wrap"}}>
   <div><p style={{fontSize:12,fontWeight:750,color:"#4e6554",textTransform:"uppercase",letterSpacing:".1em"}}>Estimated on hand</p><strong style={{fontSize:44,color:remaining<0?"#a04735":"#2d5038"}}>{ready?remaining:"—"}</strong></div>
   <p style={{fontSize:13,maxWidth:240,color:"#526b56"}}>{remaining<0?"Check your counts: more collected than recorded.":"Count the physical bundles to reconcile this estimate."}</p>
  </div>
  <label style={{display:"grid",gap:8,marginTop:22,fontWeight:700,fontSize:13}}>Stock note<textarea rows={2} value={stock.note} onChange={e=>change("note",e.target.value.slice(0,400))} placeholder="Restocked the porch, damaged bundle, etc." style={{border:"1px solid #c6d2c6",borderRadius:8,padding:12,width:"100%"}}/></label>
  <div style={{display:"flex",alignItems:"center",gap:15,flexWrap:"wrap",marginTop:18}}>
   <button className="button button-primary" onClick={save} disabled={!ready||remaining<0}>Save count on this device</button>
   <span role="status" style={{fontSize:13,color:"#526b56"}}>{saved?"Saved on this device.":stock.updated?`Last saved: ${new Date(stock.updated).toLocaleString()}`:"Not yet saved"}</span>
  </div>
  <p style={{marginTop:18,fontSize:12,lineHeight:1.6,color:"#6d746b"}}><strong>Important:</strong> This is a browser-local pilot worksheet, not shared inventory. It will not synchronize between phones, automatically deduct Stripe purchases, or survive clearing browser data. Verify payments in Stripe and update collected bundles here. A shared PuddleJumper stock ledger is the next step.</p>
 </section>;
}