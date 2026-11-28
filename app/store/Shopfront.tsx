"use client";

import { useState } from "react";
import Image from "next/image";
import { mercantilePaymentLinks } from "@/lib/mercantile-payment-links.mjs";
import { mercantileRepresentativePhotos } from "@/lib/mercantile-representative-photos.mjs";
import { mercantileStudioPhotos } from "@/lib/mercantile-studio-photos.mjs";
import styles from "./mercantile.module.css";

type Product = (typeof mercantilePaymentLinks)[number];
type Category = "All" | "Keepsakes" | "Handmade" | "Snacks";

const firewood = mercantilePaymentLinks.find((item) => item.sku === "KPL-WOOD-001");
const merchandise = mercantilePaymentLinks.filter((item) => item.sku !== "KPL-WOOD-001");

const money = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount / 100);

const categories: readonly Category[] = ["All", "Keepsakes", "Handmade", "Snacks"];
const categoryText: Record<Category, string> = {
  All: "Everything",
  Keepsakes: "Puddles & stuffies",
  Handmade: "Handmade",
  Snacks: "Snacks & treats",
};

function Checkout({ item, enabled, featured = false }: {
  item: Product;
  enabled: boolean;
  featured?: boolean;
}) {
  const label = featured ? "Buy firewood" : "Buy now";
  if (!enabled) {
    return <span className={featured ? styles.featuredDisabled : styles.buyDisabled}
      aria-label={item.name + ": checkout disabled in preview"}>
      Preview only <span aria-hidden="true">↗</span>
    </span>;
  }

  return <a className={featured ? styles.featuredBuy : styles.buy}
      href={item.stripeUrl} target="_blank" rel="noopener noreferrer"
      aria-label={"Buy " + item.name + " on Stripe, " + money(item.priceCents) + " per item"}>
    {label} <span aria-hidden="true">↗</span>
  </a>;
}

// Original Lodge merchandise on one neutral studio background wherever possible.
// Snacks without an owner-supplied item shot still use a representative image.
const studioPhotos = mercantileStudioPhotos as Record<string,{src:string;alt:string}>;
const examplePhotos = mercantileRepresentativePhotos as Record<string,{src:string;alt:string}>;
function ProductPhoto({item}:{item:Product}) {
  const local=studioPhotos[item.sku];
  const example=examplePhotos[item.sku];
  const photo=local??example;
  if(!photo)return <div className={styles.productThumbShelf} aria-label={item.name}/>;
  return <div className={styles.productThumbShelf}>
    <Image src={photo.src} alt={local?photo.alt:photo.alt+" (representative item)"}
      fill unoptimized sizes="(max-width: 700px) 115px, 145px"
      className={local?styles.studioImage:styles.referenceImage}/>
  </div>;
}

function ProductCard({ item, enabled }: {
  item: Product;
  enabled: boolean;
}) {
  const kind = item.category === "Keepsakes" ? "Puddles & friends"
    : item.category === "Handmade" ? "Handmade" : "Snacks";
  return <article className={styles.product} id={"item-" + item.sku.toLowerCase()}>
    <ProductPhoto item={item}/>
    <div className={styles.productDetails}>
      <span className={styles.productCategory}>{kind}</span>
      <div className={styles.productTitleLine}>
        <h3>{item.name}</h3>
        <strong>{money(item.priceCents)}</strong>
      </div>
      <p>{item.description}</p>
      <div className={styles.cardFoot}>
        <span>{item.sku === "KPL-PUDDLES-SET-001" ? "Save $5" : "Pick up at the Lodge"}</span>
        <Checkout item={item} enabled={enabled} />
      </div>
    </div>
  </article>;
}

export default function Shopfront({ checkoutEnabled }: { checkoutEnabled: boolean }) {
  const [category, setCategory] = useState<Category>("All");
  const items = category === "All"
    ? merchandise
    : merchandise.filter((item) => item.category === category);

  return <>
    {firewood && <section className={styles.featured} id="firewood" aria-labelledby="firewood-heading">
      <div className={styles.featuredPhoto}>
        <Image src="/images/kpl/mercantile/studio/firewood.jpg"
          alt="The actual Lodge firewood bundle on a neutral studio backdrop"
          fill sizes="(max-width: 760px) 100vw, 240px" />
      </div>
      <div className={styles.featuredInfo}>
        <span className={styles.kicker}>FIREWOOD</span>
        <h2 id="firewood-heading">Extra firewood for the firepit</h2>
        <p>Bundles are available at the Lodge. Choose your quantity at checkout.</p>
      </div>
      <div className={styles.featuredPurchase}>
        <div className={styles.featuredPrice}>
          <strong>{money(firewood.priceCents)}</strong>
          <span>per bundle</span>
        </div>
        <Checkout item={firewood} enabled={checkoutEnabled} featured />
      </div>
    </section>}

    <section id="shop" className={styles.catalog} aria-labelledby="catalog-heading">
      <div className={styles.catalogIntro}>
        <div>
          <span className={styles.kicker}>SHOP THE SHELVES</span>
          <h2 id="catalog-heading">On the shelf.</h2>
          <p>Puddles coloring books, Kendall Pond stuffies, handmade goods, and a few snacks.</p>
        </div>

      </div>
      <div className={styles.toolbar}>
        <div className={styles.filters} role="group" aria-label="Filter products by category">
          {categories.map((choice) => <button key={choice} type="button"
            className={choice === category ? styles.filterSelected : styles.filter}
            aria-pressed={choice === category}
            onClick={() => setCategory(choice)}>
            {categoryText[choice]}
          </button>)}
        </div>
        <span className={styles.productCount}>{items.length} {items.length === 1 ? "item" : "items"}</span>
      </div>
      <div className={styles.productGrid}>
        {items.map((item) => <ProductCard key={item.sku}
          item={item} enabled={checkoutEnabled} />)}
      </div>
      <p className={styles.catalogCaveat}>Most photos show real Lodge items photographed against a clean background. Candy and cookie images are representative; colors and brands may vary. Check the baskets before purchasing.</p>
    </section>

    <section className={styles.waterStrip} aria-label="Complimentary drinking water">
      <div><span className={styles.kicker}>ALWAYS INCLUDED</span>
        <h2>Water is on us.</h2>
        <p>Bottled water is complimentary for Lodge guests. Help yourself.</p></div>
      <span className={styles.waterFree}>FREE</span>
    </section>

    <section className={styles.howSection} aria-labelledby="how-heading">
      <div className={styles.howHeading}><span className={styles.kicker}>HOW IT WORKS</span>
        <h2 id="how-heading">Take what you need.</h2></div>
      <div className={styles.howSteps}>
        <div><span>01</span><strong>Choose an item.</strong><p>Find it on the shelves and check that it’s there.</p></div>
        <div><span>02</span><strong>Pay with Stripe.</strong><p>Use the item link. Adjust quantity during checkout.</p></div>
        <div><span>03</span><strong>Enjoy your stay.</strong><p>Keep your confirmation and collect your purchase.</p></div>
      </div>
      <p className={styles.howNote}>Each checkout covers one product type; the shop does not yet have a combined cart or automatic stock tracking.</p>
    </section>
  </>;
}
