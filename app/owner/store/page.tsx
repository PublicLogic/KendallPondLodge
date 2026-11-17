import type {Metadata} from "next";
import Link from "next/link";
import {BookingBrand} from "@/app/_components/BookingBrand";
import {requireKplOwner} from "@/lib/require-kpl-owner";
import {mercantilePaymentLinks,mercantileCategories} from "@/lib/mercantile-payment-links.mjs";
import styles from "@/app/store/mercantile.module.css";

export const metadata: Metadata = {
  title: "Mercantile · Lodge owner",
  robots: {index: false, follow: false},
};
export const dynamic = "force-dynamic";

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(cents / 100);

export default async function OwnerMercantile() {
  await requireKplOwner("/owner/store");
  // Owner tools in preview are read-only. No live transaction starts here.
  const production = process.env.VERCEL_ENV === "production";
  return (
    <main id="main-content" className={styles.page} style={{minHeight:"80vh"}}>
      <div className={styles.sectionInner} style={{paddingTop:55,paddingBottom:75}}>
        <BookingBrand owner />
        <p style={{marginTop:35}}><Link href="/owner">← Lodge desk</Link></p>
        <div style={{maxWidth:870,marginTop:28}}>
          <p className={styles.eyebrow}>Your Mercantile</p>
          <h1 style={{fontSize:"clamp(3rem,6vw,5.5rem)"}}>The little shop.</h1>
          <p style={{marginTop:19,color:"var(--merc-muted)",maxWidth:"62ch"}}>
            Eleven Stripe products, one shelf. Keep the baskets stocked and prices
            labeled, then check Stripe payments as items are picked up.
          </p>
        </div>
        <aside style={{marginTop:35,padding:"20px 24px",background:"#e9eee4",borderLeft:"3px solid #b89c6e"}}>
          <strong style={{fontSize:14}}>Manual checkout, not PJ inventory</strong>
          <p style={{maxWidth:"86ch",marginTop:8,fontSize:13}}>
            These Payment Links do not create PuddleJumper orders, decrement stock,
            or confirm a pickup. Verify completed payments directly in Stripe and
            reconcile the shelf count separately. The governed STAY Commerce
            inventory and ordering workflow is still in its draft release.
          </p>
        </aside>
        {mercantileCategories.map((category) => (
          <section key={category.key} style={{marginTop:53}} aria-label={category.label}>
            <p className={styles.eyebrow}>{category.label}</p>
            <ul className={styles.rows}>
              {mercantilePaymentLinks.filter((item) => item.category === category.key).map((item) => (
                <li key={item.sku} className={styles.productRow}>
                  <div className={styles.productCopy}>
                    <h3>{item.name}</h3>
                    <p>{item.sku}</p>
                  </div>
                  <strong className={styles.productPrice}>{money(item.priceCents)}</strong>
                  {production ? (
                    <a className={styles.checkout} href={item.stripeUrl} target="_blank"
                      rel="noopener noreferrer" aria-label={"Open Stripe checkout for " + item.name}>
                      Checkout <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span className={styles.checkoutDisabled}>Preview only</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p style={{marginTop:33,display:"flex",gap:22,flexWrap:"wrap"}}>
          <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer">Review actual payments in Stripe ↗</a>
          <Link href="/store">View the guest Mercantile →</Link>
        </p>
      </div>
    </main>
  );
}
