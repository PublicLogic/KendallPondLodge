// KPL owner-approved occupancy rule, 2026-11-01: Airbnb $143/night after
// two guests, discounted 10% for direct bookings. Base rates remain in PJ.
export const INCLUDED_GUESTS = 2;
export const EXTRA_GUEST_NIGHTLY_CENTS = 12870;
export function extraGuestNightly(guests) {
  if (!Number.isInteger(guests) || guests < 1 || guests > 8) throw new Error('Invalid guest count');
  return Math.max(0, guests - INCLUDED_GUESTS) * EXTRA_GUEST_NIGHTLY_CENTS;
}

/** Exact quote payload for PJ's existing availability-checked quote endpoint. */
export function directQuote(booking, settings, now = new Date()) {
  if (!settings?.configured || settings.enabled !== true || settings.airbnb_channel_guarded !== true)
    throw new Error('Instant booking is not available');
  if (booking?.status !== 'requested') throw new Error('Request is not open');
  const day = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Invalid date');
    const time = Date.parse(value + 'T00:00:00Z');
    if (!Number.isFinite(time) || new Date(time).toISOString().slice(0,10) !== value) throw new Error('Invalid date');
    return time;
  };
  const start = day(booking.check_in), end = day(booking.check_out);
  const nights = (end - start) / 86400000;
  const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
  if (!integer(nights,1,30) || !integer(settings.min_nights,1,30) || nights < settings.min_nights ||
      !integer(settings.booking_window_days,1,730) ||
      booking.check_in > new Date(now.getTime() + settings.booking_window_days * 86400000).toISOString().slice(0,10))
    throw new Error('Stay outside booking policy');
  for (const field of ['base_nightly_cents','weekend_nightly_cents','cleaning_cents','pet_fee_cents'])
    if (!integer(settings[field],field === 'base_nightly_cents' ? 1 : 0,1000000)) throw new Error('Invalid rate');
  if (settings.weekend_nightly_cents < settings.base_nightly_cents ||
      !integer(settings.tax_basis_points,0,3000) || !integer(settings.deposit_percent,1,100) ||
      !integer(settings.hold_minutes,90,360) || typeof settings.taxable_fees !== 'boolean' ||
      !['per_stay','per_pet'].includes(settings.pet_fee_mode) || !integer(booking.pets,0,2)) throw new Error('Invalid pricing policy');
  const nightly = settings.base_nightly_cents + extraGuestNightly(booking.guests);
  let weekends = 0;
  for (let i=0; i<nights; i++) if ([5,6].includes(new Date(start+i*86400000).getUTCDay())) weekends++;
  const other = weekends * (settings.weekend_nightly_cents-settings.base_nightly_cents);
  const pet = booking.pets > 0 ? settings.pet_fee_cents * (settings.pet_fee_mode === 'per_pet' ? booking.pets : 1) : 0;
  const lodging = nights * nightly + other;
  const tax = Math.round((lodging + (settings.taxable_fees ? settings.cleaning_cents + pet : 0)) * settings.tax_basis_points/10000);
  const total = lodging + settings.cleaning_cents + pet + tax;
  return {
    nightly_cents:nightly, cleaning_cents:settings.cleaning_cents, pet_cents:pet,
    other_cents:other, other_label:other ? 'Weekend rate adjustment' : '', tax_cents:tax,
    total_cents:total, deposit_cents:Math.ceil(total*settings.deposit_percent/100),
    cancellation_terms:settings.cancellation_terms, balance_terms:settings.balance_terms,
    quote_expires:new Date(now.getTime()+settings.hold_minutes*60000).toISOString(),
  };
}
