"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { dollars, storeItems } from "@/lib/mercantile-demo";
import "./mercantile.css";

export default function MercantileDemo() {
  const [basket,setBasket]=useState<Record<string,number>>({});
  const [showBasket,setShowBasket]=useState(false);
  const selected=useMemo(()=>storeItems.filter(p=>(basket[p.id]??0)>0),[basket]);
  const total=selected.reduce((sum,p)=>sum+p.priceCents*(basket[p.id]??0),0);
  const count=selected.reduce((sum,p)=>sum+(basket[p.id]??0),0);
  function change(id:string,delta:number) {
    const item=storeItems.find(p=>p.id===id);
    if(!item||!item.enabled)return;
    setBasket(prev=>({...prev,[id]:Math.max(0,Math.min(item.onHand,(prev[id]??0)+delta))}));
  }
  return <main id="main-content" className="mercantile">
    <div className="mercantile-wrap">
      <div className="mercantile-top"><Link href="/">← The Lodge</Link><span>DESIGN PREVIEW · NO ORDERS OR PAYMENTS</span></div>
      <header className="mercantile-hero">
        <p className="mercantile-kicker">The Lodge at Kendall Pond</p>
        <h1>A little shop for the things you need.</h1>
        <p>Extra firewood for the evening, a small gift to bring home, and a few good things from around here. Browse on your phone; pick up at the Lodge.</p>
        <div className="mercantile-hero-bottom"><span>Made for guests staying with us.</span><span>Pick up here · No shipping</span></div>
      </header>
      <div className="mercantile-heading"><div><p className="mercantile-kicker">The shelf</p><h2>Good things, close by.</h2></div><span>Illustrative products & quantities</span></div>
      <div className="mercantile-grid">
      {storeItems.map(item=><article className="mercantile-product" key={item.id}>
        <div className="mercantile-art" aria-hidden="true"><span>{item.symbol}</span></div>
        <div className="mercantile-product-body"><p className="mercantile-kicker">{item.category}</p>
          <h3>{item.name}</h3><p>{item.detail}</p>
          <div className="mercantile-product-footer"><strong>{dollars(item.priceCents)}</strong>
            {item.enabled ? (basket[item.id]??0)>0 ?
              <div className="mercantile-qty" aria-label={`Quantity of ${item.name}`}>
                <button onClick={()=>change(item.id,-1)} aria-label={`Remove one ${item.name}`}>−</button>
                <span>{basket[item.id]}</span><button disabled={(basket[item.id]??0)>=item.onHand} onClick={()=>change(item.id,1)} aria-label={`Add one ${item.name}`}>+</button>
              </div> : <button className="mercantile-add" onClick={()=>change(item.id,1)}>Add to basket +</button>
            : <span className="mercantile-coming">Coming later</span>}
          </div>
        </div>
      </article>)}
      </div>
      <aside className="mercantile-how"><div><p className="mercantile-kicker">How it works</p><h2>Easy as it should be.</h2></div><p>Choose what you need. When this shop opens, you’ll pay securely on your phone and get simple pickup instructions. For now, this page is an interactive design preview—nothing is charged or reserved.</p></aside>
      <footer className="mercantile-footer"><span>The Lodge at Kendall Pond · Gardner, Massachusetts</span><Link href="/guidebook">Guest guidebook</Link></footer>
    </div>
    <div className="mercantile-bottom"><div><span>{count} {count===1?"item":"items"} · {dollars(total)}</span><button onClick={()=>setShowBasket(true)} disabled={!count}>View basket</button></div></div>
    {showBasket&&<div className="mercantile-overlay" role="presentation" onMouseDown={()=>setShowBasket(false)}>
      <section className="mercantile-drawer" role="dialog" aria-modal="true" aria-labelledby="mercantile-basket-title" onMouseDown={e=>e.stopPropagation()}>
        <div className="mercantile-drawer-head"><div><p className="mercantile-kicker">Your picks</p><h2 id="mercantile-basket-title">Basket</h2></div><button onClick={()=>setShowBasket(false)} aria-label="Close basket">✕</button></div>
        {selected.map(item=><div className="mercantile-line" key={item.id}><div><strong>{item.name}</strong><p>{dollars(item.priceCents)} each</p></div><div className="mercantile-qty"><button onClick={()=>change(item.id,-1)} aria-label={`Remove one ${item.name}`}>−</button><span>{basket[item.id]}</span><button disabled={basket[item.id]>=item.onHand} onClick={()=>change(item.id,1)} aria-label={`Add one ${item.name}`}>+</button></div></div>)}
        <div className="mercantile-total"><strong>Subtotal</strong><strong>{dollars(total)}</strong></div>
        <p className="mercantile-note">Demo only. Prices, inventory, taxes, and availability are not live. Checkout is intentionally disabled until the PuddleJumper store and verified Stripe payment flow are connected.</p>
        <button className="mercantile-disabled" disabled>Secure checkout · Not yet live</button>
      </section></div>}
  </main>;
}
