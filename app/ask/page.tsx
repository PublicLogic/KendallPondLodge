import type { Metadata } from "next";
import Link from "next/link";
import { hostContactHref } from "@/lib/booking-db";
import { GuestQuestionForm } from "./GuestQuestionForm";

export const metadata: Metadata = {
  title: "Ask Nate & Allie | The Lodge at Kendall Pond",
  description: "Have a question about the Lodge, the waterfront or your dates? Write to the hosts without making a payment or reservation.",
  alternates: { canonical: "/ask" },
};

export default function AskPage() {
  return (
    <main id="main-content" className="booking-page booking-page-direct">
      <section className="content-section" aria-labelledby="ask-title">
        <div className="stay-section-heading">
          <p className="showcase-eyebrow">Hosted by Nate &amp; Allie</p>
          <h1 id="ask-title">Have a question?</h1>
          <p>We own the Lodge and live close by. Ask about the bedrooms, a possible stay, the waterfront, or anything you'd like to know before booking.</p>
          <p>There's no charge to ask, and sending a question won't hold dates.</p>
        </div>
        <div className="booking-panel">
          <GuestQuestionForm contactHref={hostContactHref()} />
        </div>
        <p className="stay-question-link">Ready to see availability and the full price? <Link href="/book">Check dates &amp; price</Link>.</p>
      </section>
    </main>
  );
}
