import Link from "next/link";

export function BookingCtaBand() {
  return (
    <section className="content-section">
      <div className="booking-cta-panel">
        <div>
          <p className="eyebrow">Come stay</p>
          <h2>Send us your dates.</h2>
          <p>We’ll check availability and send the full quote.</p>
        </div>
        <Link className="button button-primary" href="/book">Book your stay →</Link>
      </div>
    </section>
  );
}
