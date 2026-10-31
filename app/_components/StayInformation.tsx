import Link from "next/link";
import stay from "@/app/_data/public-stay.json";

export function SleepPlan() {
  return (
    <div className="stay-sleep-plan">
      <dl className="stay-sleep-grid">
        {stay.sleeping.map((room) => (
          <div key={room.id}>
            <dt>{room.name}</dt>
            <dd>{room.bed}</dd>
          </div>
        ))}
      </dl>
      <p className="stay-detail-note">{stay.sleepingNote}</p>
    </div>
  );
}

export function BookingSteps({ enabled = true, instant = false }: { enabled?: boolean; instant?: boolean }) {
  const steps = instant
    ? [
        { title: 'Choose your dates', body: 'Choose your check-in and checkout dates. We check availability before showing your price.' },
        { title: 'Review the full price', body: 'You’ll see the full total, fees, and terms before deciding.' },
        { title: 'Pay to confirm', body: 'Finish securely through Stripe. Your stay is confirmed after payment is verified.' },
      ]
    : stay.bookingSteps;

  return (
    <section className="stay-info-section" aria-labelledby="booking-steps-title">
      <div className="stay-section-heading">
        <p className="showcase-eyebrow">Direct with Nate &amp; Allie</p>
        <h2 id="booking-steps-title">Here’s how it works.</h2>
        {!enabled && <p>Direct requests are paused right now. You can still check dates and reserve on Airbnb.</p>}
      </div>
      <ol className="stay-booking-steps">
        {steps.map((step, index) => (
          <li key={step.title}>
            <span aria-hidden="true">0{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function StayFAQ({ contactHref }: { contactHref: string }) {
  return (
    <section className="stay-info-section stay-faq-section" id="before-you-book" aria-labelledby="stay-faq-title">
      <div className="stay-section-heading">
        <p className="showcase-eyebrow">A few things worth knowing</p>
        <h2 id="stay-faq-title">Before you pack.</h2>
        <p>The practical details, without a trip through the fine print.</p>
      </div>
      <div className="stay-faq-list">
        {stay.faq.map((item) => (
          <details key={item.id} id={`stay-${item.id}`}>
            <summary>{item.question}<span aria-hidden="true">+</span></summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
      <p className="stay-question-link">Something specific? <a href={contactHref}>Ask Nate &amp; Allie</a> before you book.</p>
    </section>
  );
}

export function GuestReviewEvidence() {
  const review = stay.reviewSnapshot;
  return (
    <div className="stay-review-evidence">
      <div>
        <p><strong>{review.rating}<span aria-hidden="true"> / 5</span></strong> <span>from {review.count} Airbnb reviews</span></p>
        <small>Airbnb rating checked <time dateTime={review.checkedOn}>{review.checkedLabel}</time>. Ratings can change.</small>
      </div>
      <a href={review.url} target="_blank" rel="noopener noreferrer">Read the guest reviews <span aria-hidden="true">↗</span></a>
    </div>
  );
}

export function SleepPlanLink() {
  return <Link className="showcase-inline-link" href="/lodge#sleeping">See the rooms and sleeping plan <span aria-hidden="true">→</span></Link>;
}
