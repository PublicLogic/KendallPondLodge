import type { Metadata } from "next";
import Shopfront from "./Shopfront";
import styles from "./mercantile.module.css";

export const metadata: Metadata = {
  title: "KPL Shelf Shop | The Lodge at Kendall Pond",
  description: "Firewood, handmade keepsakes and snacks for pickup during your stay at Kendall Pond.",
  alternates: { canonical: "/store" },
};

export default function StorePage() {
  const checkoutEnabled = process.env.VERCEL_ENV === "production";
  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.shopIntro}>
        <div>
          <p className={styles.kicker}>The Lodge at Kendall Pond</p>
          <h1>KPL Shelf Shop</h1>
          <p>At the lodge? Choose what's on the shelf, pay on your phone, and take it with you.</p>
        </div>
        <span className={styles.introNote}>Guest self-service · On-site pickup</span>
      </header>
      {!checkoutEnabled && <p className={styles.previewNotice}>Store preview. Checkout is disabled here.</p>}
      <Shopfront checkoutEnabled={checkoutEnabled} />
    </main>
  );
}
