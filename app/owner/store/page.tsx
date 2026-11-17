import type {Metadata} from "next";
import Link from "next/link";
import {BookingBrand} from "@/app/_components/BookingBrand";
import {requireKplOwner} from "@/lib/require-kpl-owner";
import {mercantilePaymentLinks} from "@/lib/mercantile-payment-links.mjs";

export const metadata: Metadata = {
  title: "Mercantile · Lodge owner",
  robots: {index: false, follow: false},
};
export const dynamic = "force-dynamic";

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(cents / 100);

export default async function OwnerMercantile() {
  await requireKplOwner("/owner/store");
  const live = process.env.VERCEL_ENV === "production";
  return (
    <main id="main-content" className="content-section booking-page">
      <BookingBrand owner />
      <p className="eyebrow">The Lodge at Kendall Pond</p>
      <h1>Mercantile.</h1>
      <p>Eleven hosted Stripe checkout links. The in-person shelf is intentionally small.</p>
      <p className="booking-alert" style={{margin:"22px 0"}}>
        These are individual Stripe Payment Links. They do not create booking orders,
        change PuddleJumper stock or verify a physical pickup. Check successful payment
        in Stripe before handing over merchandise, and record physical stock separately.
        Never treat a checkout redirect as proof of payment.
      </p>
      <div className="booking-grid">
        {mercantilePaymentLinks.map((item) => (
          <section className="booking-panel" key={item.sku}>
            <h2 style={{fontSize:"1.5rem"}}>{item.name}</h2>
            <p style={{fontSize:13,color:"var(--muted)",margin:"8px 0 12px"}}>
              {item.sku} · {item.category}
            </p>
            <p style={{fontSize:"1.45rem",fontWeight:750,marginBottom:14}}>
              {money(item.priceCents)}
            </p>
            {live ? (
              <a className="button button-secondary" href={item.stripeUrl}
                target="_blank" rel="noopener noreferrer">
                Open checkout ↗
              </a>
            ) : (
              <p role="status" style={{fontSize:12,color:"var(--muted)"}}>
                Checkout link disabled in Preview.
              </p>
            )}
          </section>
        ))}
      </div>
      <p style={{marginTop:25}}>
        <a className="button button-primary" href="https://dashboard.stripe.com/payments"
          target="_blank" rel="noopener noreferrer">Review Stripe payments ↗</a>
      </p>
      <p style={{marginTop:15,fontSize:13,color:"var(--muted)"}}>
        Reconcile Stripe transactions against physical pickups before adjusting inventory.
        This page does not include PJ-backed inventory management; that remains in the
        separate gated STAY Commerce rollout.
      </p>
      <p style={{marginTop:22}}><Link href="/owner">← Lodge dashboard</Link> · <Link href="/store">Guest store</Link></p>
    </main>
  );
}
