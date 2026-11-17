import type { Metadata } from "next";
import Link from "next/link";
import {
  mercantileCategories,
  mercantilePaymentLinks,
} from "@/lib/mercantile-payment-links.mjs";
import "./mercantile.css";

export const metadata: Metadata = {
  title: "The Mercantile · Lodge at Kendall Pond",
  description:
    "A little self-serve Lodge shop for firewood, handmade gifts, candy and snacks. Stripe checkout, with pickup right at Kendall Pond in Gardner, MA.",
  alternates: { canonical: "/store" },
};

export const dynamic = "force-dynamic";
const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export default function StorePage() {
  // Live Payment Links should never be clickable from Vercel Preview or local dev.
  const checkoutEnabled = process.env.VERCEL_ENV === "production";

  return (
    <main id="main-content" className="kpl-store">
      <div className="kpl-store-wrap">
        <header className="kpl-store-head">
          <p className="kpl-store-eyebrow">A little extra for your stay</p>
          <h1>The Mercantile.</h1>
          <p className="kpl-store-intro">
            Firewood for the firepit, cozy handmade things, and a few treats for
            the snack drawer. It&apos;s a little self-serve shelf here at the Lodge,
            not a big shop. Prices are kept close to our costs.
          </p>
          <p className="kpl-store-how">
            <strong>How it works:</strong> Pick your item, pay securely through
            Stripe, then collect it from the marked basket at the Lodge.
            Nothing is shipped. Please keep your payment confirmation.
          </p>
        </header>

        {!checkoutEnabled && (
          <p className="kpl-store-preview" role="status">
            Store preview · Live checkout is disabled on this preview website.
          </p>
        )}

        {mercantileCategories.map((category) => (
          <section
            key={category.key}
            className="kpl-store-section"
            aria-labelledby={"store-" + category.key.toLowerCase()}
          >
            <div className="kpl-store-section-heading">
              <h2 id={"store-" + category.key.toLowerCase()}>{category.label}</h2>
              <span>For your stay or to take home</span>
            </div>

            <div className="kpl-store-grid">
              {mercantilePaymentLinks
                .filter((item) => item.category === category.key)
                .map((item) => (
                  <article key={item.sku} className="kpl-store-item">
                    <span className="kpl-store-emoji" aria-hidden="true">{item.emoji}</span>
                    <p className="kpl-store-category">Kendall Pond Mercantile</p>
                    <h3>{item.name}</h3>
                    <p className="kpl-store-description">{item.description}</p>
                    <p className="kpl-store-price">{money(item.priceCents)}</p>

                    {checkoutEnabled ? (
                      <a
                        className="kpl-store-buy"
                        href={item.stripeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={"Buy " + item.name + " with Stripe"}
                      >
                        Pay with Stripe <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <span className="kpl-store-buy-disabled" role="status">
                        Preview only · Payment disabled
                      </span>
                    )}
                    <p className="kpl-store-footnote">
                      Quantity can be adjusted at checkout.
                      Any applicable tax is calculated by Stripe.
                    </p>
                  </article>
                ))}
            </div>
          </section>
        ))}

        <aside className="kpl-store-water" aria-label="Complimentary water">
          <span className="kpl-store-water-icon" aria-hidden="true">💧</span>
          <div>
            <strong>Bottled water is on us.</strong>
            <p>Help yourself. No checkout needed.</p>
          </div>
        </aside>

        <footer className="kpl-store-footer">
          <p>
            These are individual Stripe payment links, not a combined cart.
            Stock and pickup are handled by your hosts. If an item isn&apos;t on
            the shelf, message us through your reservation before purchasing.
          </p>
          <Link href="/guidebook">Back to the guest guidebook</Link>
        </footer>
      </div>
    </main>
  );
}
