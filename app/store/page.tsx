import type {Metadata} from "next";
import {randomUUID} from "node:crypto";
import Image from "next/image";
import Link from "next/link";
import {lodgePhoto} from "@/app/_data/lodge-photos";
import {mercantilePaymentLinks} from "@/lib/mercantile-payment-links.mjs";
import styles from "./mercantile.module.css";
import {listProducts,liveStoreCheckoutEnabled,type StoreProduct} from "@/lib/mercantile-runtime";
import {startStoreCheckout} from "./actions";

export const metadata: Metadata = {
  title: "The Mercantile | Lodge at Kendall Pond",
  description:
    "A little self-serve shop at the Lodge at Kendall Pond: firewood, handmade gifts and snacks, with secure Stripe payment and on-site pickup.",
  alternates: {canonical: "/store"},
};
export const dynamic = "force-dynamic";

const firewood = mercantilePaymentLinks.find((item) => item.sku === "KPL-WOOD-001");
const handmade = mercantilePaymentLinks.filter((item) => item.category === "Handmade");
const snacks = mercantilePaymentLinks.filter((item) => item.category === "Snacks");
const roomPhoto = lodgePhoto(5);
const firePhoto = lodgePhoto(40);

const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(cents / 100);

type Merchandise = (typeof mercantilePaymentLinks)[number];

function CheckoutLink({
  item, enabled, label = "Pay with Stripe", light = false,
}: {
  item: Merchandise;
  enabled: boolean;
  label?: string;
  light?: boolean;
}) {
  const className = light ? styles.checkoutLight : styles.checkout;
  if (!enabled) {
    return <span className={styles.checkoutDisabled} aria-label={label + " · preview only"}>
      Preview only <span aria-hidden="true">↗</span>
    </span>;
  }
  return (
    <a className={className} href={item.stripeUrl} target="_blank"
      rel="noopener noreferrer" aria-label={label + " for " + item.name}>
      {label} <span aria-hidden="true">↗</span>
    </a>
  );
}

function MerchandiseRows({items, enabled, dark = false}: {
  items: Merchandise[];
  enabled: boolean;
  dark?: boolean;
}) {
  return (
    <ul className={dark ? styles.rowsDark : styles.rows}>
      {items.map((item) => (
        <li className={styles.productRow} key={item.sku}>
          <div className={styles.productCopy}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </div>
          <strong className={styles.productPrice}>{usd(item.priceCents)}</strong>
          <CheckoutLink item={item} enabled={enabled} label="Pay" light={dark} />
        </li>
      ))}
    </ul>
  );
}

export default async function StorePage({searchParams}:{searchParams:Promise<{error?:string;canceled?:string}>}) {
  const {error,canceled}=await searchParams;
  const commerce=liveStoreCheckoutEnabled();
  let pjItems:StoreProduct[]=[];
  let connected=false;
  if(commerce){try{pjItems=await listProducts("guest");connected=true;}catch{}}
  // Manual live Payment Links never run inside preview, and never alongside PJ checkout.
  const checkoutEnabled = !commerce && process.env.VERCEL_ENV === "production";
  return (
    <main id="main-content" className={styles.page} data-mercantile-editorial>
      <section className={styles.opening} aria-labelledby="mercantile-title">
        <div className={styles.openingCopy}>
          <p className={styles.eyebrow}>The Lodge at Kendall Pond · Gardner, Massachusetts</p>
          <h1 id="mercantile-title">A few good things.<br /><em>Right here.</em></h1>
          <p className={styles.openingIntro}>
            Another evening by the fire, something cozy to bring home,
            or a snack for later. We keep a few things on the shelf
            so you don&apos;t have to make another trip into town.
          </p>
          <nav className={styles.openingNav} aria-label="Browse the Mercantile">
            <a href="#firewood">Firewood <span aria-hidden="true">↓</span></a>
            <a href="#handmade">Handmade <span aria-hidden="true">↓</span></a>
            <a href="#snacks">Snacks <span aria-hidden="true">↓</span></a>
          </nav>
          <p className={styles.openingFine}>For Lodge guests · On-site pickup · Secure Stripe payment</p>
        </div>
        <figure className={styles.openingPhoto}>
          <Image src={roomPhoto.src} alt={roomPhoto.alt} fill priority
            sizes="(max-width: 850px) 100vw, 46vw" />
          <figcaption>Make yourself at home.</figcaption>
        </figure>
      </section>

      {commerce && <section className={styles.pjCatalog} aria-labelledby="governed-store-title">
        <div className={styles.sectionInner}>
          <p className={styles.eyebrow}>PuddleJumper STAY Commerce</p>
          <h2 id="governed-store-title">The Lodge shelf.</h2>
          <p className={styles.pjIntro}>Published items are checked against current stock by the Lodge store runtime.
            Pay through Stripe; a receipt only confirms an order after the payment is verified.</p>
          {error && <p className={styles.pjError} role="alert">Checkout could not be started. No payment was confirmed.</p>}
          {canceled && <p className={styles.pjError} role="status">Checkout was canceled. No purchase was confirmed.</p>}
          {!connected ? <p className={styles.pjError} role="status">The connected Lodge store is temporarily unavailable. No orders can be placed until it reconnects.</p>
           : pjItems.length === 0 ? <p className={styles.pjIntro}>Nothing is published for purchase right now. Ask us if you need a hand.</p>
           : <ul className={styles.rows}>
              {pjItems.map((item)=><li key={item.id} className={styles.productRow}>
                <div className={styles.productCopy}>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <small className={styles.pjStock}>{item.on_hand} currently in stock</small>
                </div>
                <strong className={styles.productPrice}>{usd(item.price_cents)}</strong>
                {item.on_hand>0 ? <form action={startStoreCheckout} className={styles.pjForm}>
                  <input type="hidden" name="product_id" value={item.id}/>
                  <input type="hidden" name="request_key" value={randomUUID()}/>
                  <label>Qty <input name="quantity" type="number" min={1} max={Math.min(10,item.on_hand)} defaultValue={1} required/></label>
                  <button className={styles.checkout} type="submit">Pay ↗</button>
                </form>:<span className={styles.checkoutDisabled}>Out of stock</span>}
              </li>)}
             </ul>}
        </div>
      </section>}
      {!commerce && <>
      {!checkoutEnabled && (
        <p className={styles.previewNote} role="status">
          <strong>Store preview.</strong> You can browse everything here;
          payment links are disabled until this page is published.
        </p>
      )}

      <section id="firewood" className={styles.firewood} aria-labelledby="firewood-title">
        <figure className={styles.firePhoto}>
          <Image src={firePhoto.src} alt={firePhoto.alt} fill
            sizes="(max-width: 850px) 100vw, 51vw" />
          <figcaption>The firepit, just above the pond.</figcaption>
        </figure>
        <div className={styles.fireCopy}>
          <p className={styles.eyebrow}>For another evening outside</p>
          <h2 id="firewood-title">One more<br /><em>fire by the pond.</em></h2>
          <p>Want to stay out a little longer? Extra bundles are available here at the Lodge.</p>
          {firewood && (
            <div className={styles.firePurchase}>
              <div><span>Firewood bundle</span><strong>{usd(firewood.priceCents)}</strong></div>
              <CheckoutLink item={firewood} enabled={checkoutEnabled} label="Get a bundle" />
            </div>
          )}
          <small>Pick up at the Lodge. Choose the number of bundles during Stripe checkout.</small>
        </div>
      </section>

      <section id="handmade" className={styles.handmade} aria-labelledby="handmade-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionIntroduction}>
            <div>
              <p className={styles.eyebrow}>From the baskets</p>
              <h2 id="handmade-title">Made by hand.<br /><em>Made to keep.</em></h2>
            </div>
            <p>Hats, mittens, slippers, and a few little friends. Pick the color or style you like from what&apos;s on the shelf.</p>
          </div>
          <MerchandiseRows items={handmade} enabled={checkoutEnabled} />
        </div>
      </section>

      <section id="snacks" className={styles.snacks} aria-labelledby="snacks-title">
        <div className={styles.sectionInner}>
          <div className={styles.snackHeader}>
            <div>
              <p className={styles.eyebrow}>The snack drawer</p>
              <h2 id="snacks-title">A little something<br /><em>for later.</em></h2>
            </div>
            <p>Nothing fancy. Just a few treats for movie night, the kids, or the ride home. We keep the prices close to what they cost us.</p>
          </div>
          <MerchandiseRows items={snacks} enabled={checkoutEnabled} dark />
          <div className={styles.water}>
            <span>Bottled water</span>
            <strong>On us.</strong>
            <p>Help yourself. No checkout needed.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className={styles.how} aria-labelledby="how-title">
        <div className={styles.sectionInner}>
          <div className={styles.howIntro}>
            <p className={styles.eyebrow}>Simple by design</p>
            <h2 id="how-title">See something<br />you like?</h2>
          </div>
          <ol className={styles.steps}>
            <li><span>01</span><div><h3>Choose it.</h3><p>Take a look at what&apos;s actually on the shelf. If you don&apos;t see it, ask us before paying.</p></div></li>
            <li><span>02</span><div><h3>Pay on your phone.</h3><p>Each item has its own secure Stripe checkout. You can change the quantity there.</p></div></li>
            <li><span>03</span><div><h3>Enjoy it.</h3><p>Keep your payment confirmation and collect your item right here. No delivery or shipping.</p></div></li>
          </ol>
        </div>
      </section>

      <section className={styles.closing}>
        <div className={styles.sectionInner}>
          <div>
            <p className={styles.eyebrow}>From Nate &amp; Allie</p>
            <h2>Need something else?</h2>
            <p>We&apos;re nearby. Message us through your reservation if you need a hand or something on the shelf is missing.</p>
          </div>
          <Link href="/guidebook" className={styles.closingLink}>
            Back to your Lodge guide <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      </>}
    </main>
  );
}
