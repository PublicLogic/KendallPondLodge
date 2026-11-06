import type { Metadata } from 'next';
import { CheckoutChecklist } from '../../_components/CheckoutChecklist';

export const metadata: Metadata = { title: 'Checkout' };

export default function GuestCheckout() {
  return (
    <section className="gb-section">
      <p className="gb-eyebrow">Heading home</p>
      <h1>One last look.</h1>
      <p>Your reservation message has your confirmed checkout time and any stay-specific instructions.</p>
      <CheckoutChecklist />
    </section>
  );
}
