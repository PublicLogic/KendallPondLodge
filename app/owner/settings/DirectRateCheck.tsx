"use client";

import { useState } from "react";
import { extraGuestNightly } from "@/lib/direct-pricing.mjs";

type Pricing = {
  base_nightly_cents: number;
  weekend_nightly_cents: number;
  cleaning_cents: number;
  pet_fee_cents: number;
  pet_fee_mode: "per_stay" | "per_pet";
  tax_basis_points: number;
  taxable_fees: boolean;
};

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

/** An owner planning aid, not a new rate source or a pricing change. */
export function DirectRateCheck({ pricing }: { pricing: Pricing }) {
  const [nightCount, setNightCount] = useState(3);
  const [weekendCount, setWeekendCount] = useState(1);
  const [guestCount, setGuestCount] = useState(2);
  const [petCount, setPetCount] = useState(0);
  const [airbnbPrice, setAirbnbPrice] = useState("");
  const nights = Math.max(1, Math.min(30, Math.floor(nightCount || 1)));
  const weekends = Math.min(nights, Math.max(0, Math.floor(weekendCount || 0)));
  const pets = Math.max(0, Math.min(2, Math.floor(petCount || 0)));
  const guests = Math.max(1, Math.min(8, Math.floor(guestCount || 1)));
  const nightsSubtotal = nights * (pricing.base_nightly_cents + extraGuestNightly(guests))
    + weekends * (pricing.weekend_nightly_cents - pricing.base_nightly_cents);
  const petFee = pets > 0 ? pricing.pet_fee_cents * (pricing.pet_fee_mode === "per_pet" ? pets : 1) : 0;
  const stay = nightsSubtotal + pricing.cleaning_cents;
  const taxable = nightsSubtotal + (pricing.taxable_fees ? pricing.cleaning_cents + petFee : 0);
  const tax = Math.round(taxable * pricing.tax_basis_points / 10_000);
  const total = stay + petFee + tax;

  const airbnbDollars = Number(airbnbPrice);
  const benchmark = airbnbPrice.trim() && Number.isFinite(airbnbDollars) && airbnbDollars > 0
    ? Math.round(airbnbDollars * 100) : null;
  const difference = benchmark === null ? null : benchmark - total;
  const target = benchmark === null ? null : Math.floor(benchmark * 0.9);

  return (
    <aside className="owner-rate-check" aria-label="Direct price versus Airbnb comparison">
      <div className="owner-rate-check-head">
        <div>
          <p className="eyebrow">Pricing check</p>
          <h3>Keep direct 10% below Airbnb.</h3>
        </div>
        <p>Use the final Airbnb checkout total for the <strong>same nights, guests, and pets</strong>, including guest service fees and taxes. Do not use the host payout. This check does not change booking rates.</p>
      </div>
      <div className="owner-rate-check-fields">
        <label>Nights
          <input type="number" min={1} max={30} value={nightCount} onChange={e=>setNightCount(Number(e.target.value))}/>
        </label>
        <label>Fri / Sat nights
          <input type="number" min={0} max={nights} value={weekendCount} onChange={e=>setWeekendCount(Number(e.target.value))}/>
        </label>
        <label>Guests
          <input type="number" min={1} max={8} value={guestCount} onChange={e=>setGuestCount(Number(e.target.value))}/>
        </label>
        <label>Pets
          <input type="number" min={0} max={2} value={petCount} onChange={e=>setPetCount(Number(e.target.value))}/>
        </label>
        <label>Airbnb guest total ($)
          <input type="number" min=".01" step=".01" inputMode="decimal" value={airbnbPrice} placeholder="Include all fees & taxes" onChange={e=>setAirbnbPrice(e.target.value)}/>
        </label>
      </div>
      <div className="owner-rate-check-result" role="status" aria-live="polite">
        <div><span>Direct estimate · cleaning included</span><strong>{money(stay)}</strong></div>
        <div><span>Pets (separate)</span><strong>{money(petFee)}</strong></div>
        <div><span>Tax</span><strong>{money(tax)}</strong></div>
        <div><span>Direct total</span><strong>{money(total)}</strong></div>
        {target !== null && <div><span>10% below Airbnb · maximum direct total</span><strong>{money(target)}</strong></div>}
        {difference !== null && <p>
          {target !== null && total <= target
            ? `The 10% target is met. Direct is ${money(difference)} less for this comparison.`
            : `The 10% target is not met. Reduce the direct total by ${money(total - (target ?? total))} for this comparison.`}
        </p>}
      </div>
      <p>Base rates cover two guests. Each additional guest adds $128.70 per night, included in the stay price.</p>
      <p className="owner-card-footnote">Airbnb host fees are deducted from your payout; do not add them again to the guest total or subtract them again from the direct target. Direct guests pay the stay, pets and tax shown above. Stripe processing comes out of the payment received. This check does not fetch Airbnb prices or save rates. Verify the final totals before claiming a saving.</p>
    </aside>
  );
}
