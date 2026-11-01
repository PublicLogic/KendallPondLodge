# Direct booking occupancy pricing

Owner decision, November 1, 2026: include two guests in the base rate; charge $128.70 per additional guest per night. This is 10% below the verified Airbnb extra-guest setting of $143 after two guests. Maximum occupancy remains eight. This does not guarantee a fixed discount against every Airbnb stay total or synchronize Airbnb Smart Pricing.

KPL's server reads the saved request and property settings from PJ, calculates the complete quote, and submits it to PJ's existing quote endpoint. That endpoint checks fresh Airbnb availability, reservation overlap, request state, policy and exact arithmetic before saving it. The existing PJ auto-price endpoint lacks occupancy pricing and is no longer used by KPL. Other direct callers of that old backend endpoint would not receive this KPL rule.

Extra guest charges are lodging: included in nightly_cents for every night and subject to the configured lodging tax. Fri/Sat adjustments, pets, cleaning, tax and deposit settings continue to come from PJ. Guest display, email and Stripe use the saved PJ quote; no browser-supplied price is accepted. Owner rate comparison uses the same occupancy function.

Previously issued quotes retain their original amounts. Release unpaid underpriced test quotes through Owner Bookings; do not alter a paid booking or an accepted payment in place.

Verification: tests/extra-guest-pricing.test.mjs covers one, two, three, four and eight guests, mixed weekday/weekend nights, pets, disabled/unguarded policies, invalid counts, minimum stay/window, exact deposit rounding and the deposit sent to Stripe. Full core tests and Next build run before release. Existing copy-only tests for removed branding/headlines were removed; payment and availability guard checks remain.
