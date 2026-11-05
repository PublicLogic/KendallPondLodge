import type { Metadata } from "next";
import Link from "next/link";
import { requireKplOwner } from "@/lib/require-kpl-owner";
import { dollars, storeItems } from "@/lib/mercantile-demo";
export const metadata:Metadata={title:"Mercantile · Owner preview",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function OwnerStore(){
  await requireKplOwner("/owner/store");
  const enabled=storeItems.filter(x=>x.enabled);
  const stock=enabled.reduce((sum,x)=>sum+x.onHand,0);
  const value=enabled.reduce((sum,x)=>sum+x.onHand*x.costCents,0);
  return <main id="main-content" style={{maxWidth:1080,margin:"0 auto",padding:"clamp(24px,5vw,65px) 20px 90px"}}>
    <p className="eyebrow">Kendall Pond · Owner preview</p><h1 style={{fontSize:"clamp(2.8rem,6vw,5rem)",margin:"12px 0"}}>The little shop.</h1>
    <p style={{maxWidth:650,color:"var(--muted)"}}>One shelf now. Two properties later. This is the proposed owner workflow, using sample figures—not connected stock, orders, or Stripe.</p>
    <div style={{display:"flex",gap:12,flexWrap:"wrap",margin:"30px 0"}}>
      <Link className="button button-secondary" href="/owner">← Owner desk</Link>
      <Link className="button button-primary" href="/store">View guest store</Link>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,margin:"30px 0"}}>
      {[["Products",String(enabled.length)],["Units on shelf",String(stock)],["Stock cost",dollars(value)],["Sales","Not connected"]].map(([label,value])=>
        <div key={label} style={{background:"#fff",border:"1px solid var(--line)",borderRadius:12,padding:22}}><p style={{fontSize:13,color:"var(--muted)"}}>{label}</p><strong style={{fontSize:25}}>{value}</strong></div>)}
    </div>
    <section style={{background:"#fff",border:"1px solid var(--line)",borderRadius:12,padding:22,overflowX:"auto"}}>
      <h2 style={{fontSize:"2rem",marginBottom:10}}>Catalog & inventory</h2>
      <p style={{color:"var(--muted)",marginBottom:20}}>A future owner can edit products, stock, consignment suppliers, and pickup locations here. No controls write data in this mockup.</p>
      <table style={{width:"100%",minWidth:620,borderCollapse:"collapse",textAlign:"left"}}>
        <thead><tr>{["Product","Price","On hand","Source","Status"].map(x=><th key={x} style={{padding:"12px 8px",borderBottom:"1px solid var(--line)"}}>{x}</th>)}</tr></thead>
        <tbody>{storeItems.map(x=><tr key={x.id}>{[x.name,dollars(x.priceCents),String(x.onHand),x.source.replaceAll("_"," "),x.enabled?"Sample active":"Hold for review"].map((v,i)=><td key={i} style={{padding:"14px 8px",borderBottom:"1px solid var(--line)"}}>{v}</td>)}</tr>)}</tbody>
      </table>
    </section>
    <section style={{marginTop:26,background:"#e3ebe4",padding:25,borderRadius:12}}>
      <h2 style={{fontSize:"1.8rem"}}>Where the real data will live</h2>
      <p style={{marginTop:12}}>Products, location stock, suppliers, consignment liabilities and verified orders will live in property-scoped tables in the existing PuddleJumper StayOS SQLite runtime on Fly.io. This branch contains only sample data. Payments will use a separate Stripe Checkout flow and signed webhook; booking payment handlers must not be reused for store orders.</p>
    </section>
  </main>;
}
