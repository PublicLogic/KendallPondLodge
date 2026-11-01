import type { Booking } from './booking-db';
export type GuestPriceSummary = {
  stay_cents: number;
  cleaning_included_cents: number;
  pet_cents: number;
  tax_cents: number;
  other_cents: number;
  other_label: string | null;
  matches_total: boolean;
};
export function guestPriceBreakdown(quote: Pick<Booking,
 'nightly_cents'|'cleaning_cents'|'pet_cents'|'tax_cents'|'other_cents'|'other_label'|'total_cents'>,
 nights: number): GuestPriceSummary;
