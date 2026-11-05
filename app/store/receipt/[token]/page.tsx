import type {Metadata} from 'next';
import Link from 'next/link';
import {catalog} from '@/lib/mercantile-runtime';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Mercantile receipt',robots:{index:false,follow:false},referrer:'no-referrer'};
type Receipt={status:string;quantity:number;total_cents:number;fulfilled_at:string|null};
export default async function ReceiptPage({params}:{params:Promise<{token:string}>}){
 const {token}=await params;
 let receipt:Receipt|null=null;
 if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)){
   try{receipt=await catalog<Receipt>('GET','/orders/receipt/'+token,'guest');}catch{}
 }
 const paid=receipt?.status==='paid'||receipt?.status==='fulfilled';
 const review=receipt?.status==='needs_review';
 return <main id="main-content" style={{minHeight:'70vh',background:'#f7f6f2',padding:'clamp(50px,8vw,105px) 20px'}}>
  <section style={{maxWidth:610,margin:'auto'}}>
   <p style={{fontSize:12,letterSpacing:'.12em',fontWeight:700,color:'#658070'}}>THE LODGE · MERCANTILE</p>
   <h1 style={{fontSize:'clamp(3rem,7vw,5rem)',margin:'20px 0'}}>
     {paid?'Payment received.':review?'We need to check your payment.':'Checking your payment.'}
   </h1>
   <p style={{fontSize:'1.05rem',lineHeight:1.75,color:'#576a5c'}}>
    {paid?('Your order for '+receipt?.quantity ?? 0+' item'+(receipt?.quantity ?? 0===1?'':'s')+' is confirmed. Keep your Stripe receipt and contact us for pickup.'):
      review?'Please do not collect items yet. Contact us through your reservation so we can reconcile the payment.':
      'A checkout return alone does not confirm payment. Keep your Stripe confirmation and refresh this page to check the verified order status.'}
   </p>
   {paid&&<p style={{marginTop:25,fontWeight:700}}>Paid total: {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((receipt?.total_cents??0)/100)}</p>}
   <div style={{marginTop:33,display:'flex',gap:20,flexWrap:'wrap'}}>
     <Link href="/store">Back to the shop</Link>
     {!paid&&<Link href={'/store/receipt/'+token}>Refresh status</Link>}
   </div>
  </section>
 </main>;
}
