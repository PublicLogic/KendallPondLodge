/**
 * Guest-facing presentation only. PJ remains the authority for exact money,
 * taxes, deposit, and payment truth. Never alter amounts sent to Stripe here.
 * Housekeeping is folded into the stay line; pet fees remain separate.
 */
export function guestPriceBreakdown(quote, nights) {
  const nightly = quote.nightly_cents ?? 0;
  const cleaning = quote.cleaning_cents ?? 0;
  const pets = quote.pet_cents ?? 0;
  const tax = quote.tax_cents ?? 0;
  const other = quote.other_cents ?? 0;
  const weekend = quote.other_label === 'Weekend rate adjustment' ? other : 0;
  const extra = other - weekend;
  const stay = nights * nightly + cleaning + weekend;
  const calculated = stay + pets + tax + extra;
  return {
    stay_cents: stay,
    cleaning_included_cents: cleaning,
    pet_cents: pets,
    tax_cents: tax,
    other_cents: extra,
    other_label: extra > 0 ? (quote.other_label || 'Additional charge') : null,
    matches_total: calculated === quote.total_cents,
  };
}
