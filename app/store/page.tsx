import type { Metadata } from "next";
import Link from "next/link";
export const metadata:Metadata={title:"Kendall Pond Mercantile · Firewood",description:"Firewood bundles for guests staying at the Lodge at Kendall Pond."};
const checkout="https://pay.publiclogic.org/b/fZudRa4hU6Bv31f9SRgYU03";
export default function StorePage(){
 return <main id="main-content" style={{background:"#f5f0e8",minHeight:"80vh",padding:"clamp(28px,6vw,80px) 20px"}}>
  <div style={{maxWidth:1000,margin:"0 auto"}}>
   <p style={{fontSize:12,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:"#536c56"}}>The Lodge at Kendall Pond</p>
   <h1 style={{fontSize:"clamp(3rem,7vw,6rem)",maxWidth:820,margin:"18px 0 20px",color:"#253c30"}}>A little more time by the fire.</h1>
   <p style={{maxWidth:600,fontSize:"1.1rem",lineHeight:1.7,color:"#4c6053"}}>Need another bundle? We keep firewood available for evenings at the Lodge. Pay on your phone and collect it here. No account, shipping, or extra steps.</p>
   <section style={{marginTop:44,display:"grid",gridTemplateColumns:"minmax(0,1fr)",maxWidth:700,background:"#fff",border:"1px solid #d8dfd6",borderRadius:16,overflow:"hidden"}}>
    <div style={{background:"linear-gradient(145deg,#d6dfd1,#ede1cc)",minHeight:190,display:"grid",placeItems:"center"}} aria-hidden="true"><span style={{fontSize:80}}>🪵</span></div>
    <div style={{padding:"clamp(22px,4vw,36px)"}}>
     <p style={{fontSize:12,color:"#59725f",fontWeight:750,textTransform:"uppercase",letterSpacing:"0.1em"}}>For the firepit</p>
     <h2 style={{fontSize:"clamp(2rem,4vw,3rem)",margin:"10px 0",color:"#253c30"}}>Firewood bundle</h2>
     <p style={{color:"#596a5e",lineHeight:1.65}}>One ready-to-burn bundle. Choose how many you need at checkout (up to 10). Available for on-site pickup only.</p>
     <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,flexWrap:"wrap",marginTop:26}}>
      <strong style={{fontSize:29,color:"#253c30"}}>$10 <span style={{fontSize:14,fontWeight:400}}>per bundle, before any applicable tax</span></strong>
      <a href={checkout} rel="noopener noreferrer" style={{background:"#2e4d3c",color:"white",padding:"15px 24px",borderRadius:9,fontWeight:750,textDecoration:"none",display:"inline-block"}}>Buy firewood securely ↗</a>
     </div>
    </div>
   </section>
   <div style={{maxWidth:700,marginTop:26,padding:"22px 24px",border:"1px solid #d5ddcf",borderRadius:12}}>
    <strong>How pickup works</strong><p style={{marginTop:7,color:"#526456",lineHeight:1.7}}>After payment, keep your Stripe confirmation and check with us for the pickup location. Please only take the number of bundles purchased.</p>
   </div>
   <p style={{marginTop:28,color:"#526456",fontSize:14}}>Questions? Message us through your reservation. <Link href="/guidebook">Back to the guest guidebook</Link>.</p>
  </div>
 </main>;
}
