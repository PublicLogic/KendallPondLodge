import type {Metadata} from 'next';
import {randomUUID} from 'node:crypto';
import Link from 'next/link';
import {listProducts,type StoreProduct} from '@/lib/mercantile-runtime';
import {startStoreCheckout} from './actions';
import {liveStoreCheckoutEnabled} from '@/lib/mercantile-runtime';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'The Mercantile',description:'Firewood and a few good things for your stay at Kendall Pond.'};
const oldFirewoodLink='https://pay.publiclogic.org/b/fZudRa4hU6Bv31f9SRgYU03';
const upcoming=['Local honey & maple','Coffee & cocoa','Homegoods & gifts'];
const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100);
const productBox={padding:'clamp(20px,4vw,35px)',border:'1px solid #e1e5dd',borderRadius:13,background:'#fff'} as const;
export default async function StorePage({searchParams}:{searchParams:Promise<{error?:string;canceled?:string}>}){
 const {error,canceled}=await searchParams;
 const enabled=liveStoreCheckoutEnabled();
 let items:StoreProduct[]=[];let connected=false;
 try{items=await listProducts('guest');connected=true;}catch{}
 const available=enabled&&connected?items:[];
 const fallback=!enabled;
 const allowLiveFallback=process.env.VERCEL_ENV==='production';
 return <main id="main-content" style={{minHeight:'80vh',background:'#f7f6f2',padding:'clamp(30px,6vw,78px) 18px 90px'}}>
 <div style={{maxWidth:990,margin:'auto'}}>
  <p style={{fontSize:12,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'#63766a'}}>The Lodge at Kendall Pond</p>
  <h1 style={{fontSize:'clamp(3.2rem,7vw,5.8rem)',margin:'16px 0 22px'}}>A little shop for your stay.</h1>
  <p style={{maxWidth:640,color:'#596c60',lineHeight:1.7,fontSize:'1.04rem'}}>Some extra firewood for tonight, and a few good things from around here. We’re starting small.</p>
  {error&&<p role="alert" style={{marginTop:22,color:'#934335'}}>Checkout could not be started. No payment was confirmed. Please try again or contact us through your reservation.</p>}
  {canceled&&<p role="status" style={{marginTop:22}}>Checkout was canceled. Nothing has been confirmed.</p>}
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:17,marginTop:38}}>
    {fallback&&<article style={productBox}>
      <div aria-hidden="true" style={{fontSize:60}}>🪵</div>
      <p style={{color:'#597460',fontSize:12,fontWeight:700,letterSpacing:'.1em',marginTop:16}}>CURRENTLY AVAILABLE TO ORDER</p>
      <h2 style={{fontSize:'2.2rem',margin:'9px 0 14px'}}>Firewood bundle</h2>
      <p style={{color:'#657368'}}>One bundle for the firepit. Pay securely on your phone; arrange pickup at the Lodge.</p>
      <p style={{fontSize:25,fontWeight:750,margin:'21px 0'}}>$10.00</p>
      {allowLiveFallback?<a href={oldFirewoodLink} style={{display:'inline-block',background:'#2b4b37',color:'white',padding:'13px 22px',borderRadius:8,textDecoration:'none',fontWeight:700}}>Buy with Stripe ↗</a>:<span role="status" style={{display:'inline-block',background:'#e5eae3',color:'#4b5f50',padding:'13px 22px',borderRadius:8,fontWeight:700}}>Preview only · Payment disabled</span>}
      <p style={{fontSize:12,color:'#637368',marginTop:13}}>{allowLiveFallback?'Current Stripe checkout; physical inventory is managed by the host.':'Preview is read-only. Test checkout requires isolated Stripe test keys and a staging PJ runtime.'}</p>
    </article>}
    {available.map(item=><article key={item.id} style={productBox}>
      <p style={{fontSize:12,letterSpacing:'.1em',color:'#5d7562',fontWeight:700}}>LODGE MERCANTILE</p>
      <h2 style={{fontSize:'2.1rem',margin:'14px 0'}}>{item.name}</h2>
      <p style={{color:'#657368',lineHeight:1.65}}>{item.description}</p>
      <p style={{fontSize:25,fontWeight:750,margin:'21px 0'}}>{money(item.price_cents)}</p>
      {item.on_hand>0?<form action={startStoreCheckout}>
        <input type="hidden" name="product_id" value={item.id}/>
        <input type="hidden" name="request_key" value={randomUUID()}/>
        <label style={{display:'block',fontSize:13,fontWeight:700,marginBottom:8}}>Quantity
          <input name="quantity" type="number" min={1} max={Math.min(item.on_hand,10)} defaultValue={1} required
            style={{display:'block',width:95,border:'1px solid #c8d2c8',padding:11,borderRadius:7,marginTop:7}}/>
        </label>
        <button type="submit" style={{background:'#2b4b37',color:'white',padding:'13px 22px',borderRadius:8,fontWeight:700}}>Pay securely ↗</button>
      </form>:<p style={{fontSize:14,fontWeight:700,color:'#64766a'}}>Currently out of stock</p>}
    </article>)}
  </div>
  {enabled&&!connected&&<p role="status" style={{marginTop:25}}>The shop is temporarily unavailable. No orders can be placed until the store reconnects.</p>}
  <div style={{marginTop:64}}>
    <p style={{fontSize:12,letterSpacing:'.12em',fontWeight:700,color:'#63776b'}}>MORE COMING SOON</p>
    <h2 style={{fontSize:'clamp(2rem,4vw,3.1rem)',margin:'12px 0 20px'}}>Good things on the way.</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
     {upcoming.map(name=><div key={name} style={{...productBox,background:'#f0f2ec',color:'#4d6052'}}><strong>{name}</strong><p style={{marginTop:9,fontSize:13}}>Coming soon</p></div>)}
    </div>
  </div>
  <p style={{fontSize:14,color:'#637368',marginTop:40}}>Pickup is at the Lodge. Keep your payment confirmation and check with us before collecting your items. <Link href="/guidebook">Guest guidebook</Link></p>
 </div></main>;
}
