"use client";

import { useState } from "react";
import Image from "next/image";
import { lodgePhoto } from "@/app/_data/lodge-photos";
import { mercantilePaymentLinks } from "@/lib/mercantile-payment-links.mjs";
import styles from "./mercantile.module.css";

type Product = (typeof mercantilePaymentLinks)[number];
type Category = "All" | "Handmade" | "Snacks";

const firewood = mercantilePaymentLinks.find((item) => item.sku === "KPL-WOOD-001");
const merchandise = mercantilePaymentLinks.filter((item) => item.sku !== "KPL-WOOD-001");
const firepit = lodgePhoto(40);

const money = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount / 100);

const categories: readonly Category[] = ["All", "Handmade", "Snacks"];
const categoryText: Record<Category, string> = {
  All: "Everything",
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

function ProductCard({ item, enabled, index }: {
  item: Product;
  enabled: boolean;
  index: number;
}) {
  const handmade = item.category === "Handmade";
  return <article className={styles.product} id={"item-" + item.sku.toLowerCase()} aria-label={item.name}>
    <div className={handmade ? styles.productMediaMade : styles.productMediaSnack}>
      <div className={styles.mediaTop}>
        <span>{handmade ? "HANDMADE" : "THE PANTRY"}</span>
        <span>{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className={styles.mediaCenter}>
        <span>{item.name}</span>
      </div>
      <span className={styles.mediaFoot}>{handmade ? "MADE IN SMALL BATCHES" : "A LITTLE SOMETHING EXTRA"}</span>
    </div>
    <div className={styles.productDetails}>
      <div className={styles.productTitleLine}>
        <h3>{item.name}</h3>
        <strong>{money(item.priceCents)}</strong>
      </div>
      <p>{item.description}</p>
      <div className={styles.cardFoot}>
        <span>Pickup at the Lodge</span>
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
        <Image src={firepit.src} alt={firepit.alt} fill
          sizes="(max-width: 760px) 100vw, 55vw" />
        <span>AT THE FIREPIT</span>
      </div>
      <div className={styles.featuredInfo}>
        <span className={styles.kicker}>THE GUEST FAVORITE</span>
        <h2 id="firewood-heading">One more night by the fire.</h2>
        <p>Extra firewood for the firepit. No trip into town, and no delivery to coordinate.</p>
        <div className={styles.featuredPurchase}>
          <div className={styles.featuredPrice}>
            <strong>{money(firewood.priceCents)}</strong>
            <span>per bundle</span>
          </div>
          <Checkout item={firewood} enabled={checkoutEnabled} featured />
        </div>
        <p className={styles.featuredFine}>Choose your quantity at Stripe checkout. Collect from the Lodge.</p>
      </div>
    </section>}

    <section id="shop" className={styles.catalog} aria-labelledby="catalog-heading">
      <div className={styles.catalogIntro}>
        <div>
          <span className={styles.kicker}>THE LODGE SHOP</span>
          <h2 id="catalog-heading">On the shelf.</h2>
          <p>A few handmade things and snacks worth having around. What you see at the Lodge is what’s available to take home.</p>
        </div>
        <p className={styles.catalogAside}>Browse the categories. Every item has its own secure Stripe checkout—no account or new app required.</p>
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
        {items.map((item, index) => <ProductCard key={item.sku}
          item={item} index={index} enabled={checkoutEnabled} />)}
      </div>
      <p className={styles.catalogCaveat}>Individual colors, patterns, brands and quantities vary by what’s on the shelves. Please check the basket before purchasing.</p>
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
