"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { bookingClient } from "@/lib/booking-db";
import { fetchAirbnbIcs, parseIcsEvents } from "@/lib/airbnb-ical.mjs";
import { OWNER_COOKIE_NAME, verifyOwnerSessionToken } from "@/lib/owner-auth.mjs";

export async function syncAirbnbCalendar(): Promise<void> {
  const session = (await cookies()).get(OWNER_COOKIE_NAME)?.value;
  if (!verifyOwnerSessionToken(session)) {
    redirect("/owner/access?next=/owner/settings");
  }

  const url = process.env.KPL_AIRBNB_ICAL_URL?.trim();
  if (!url) {
    redirect("/owner/settings?calendar=missing");
  }

  let outcome = "error";
  let eventCount = 0;
  try {
    const ics = await fetchAirbnbIcs({ fresh: true });
    eventCount = parseIcsEvents(ics).length;
    await bookingClient().registerCalendar(url);
    const status = await bookingClient().contentStatus();
    outcome = status.calendarConfigured ? "registered" : "unverified";
  } catch {
    outcome = "error";
  }

  const suffix = outcome === "registered" ? "&events=" + Math.min(eventCount, 9999) : "";
  redirect("/owner/settings?calendar=" + outcome + suffix);
}


function wholeNumber(form: FormData, name: string, min: number, max: number) {
  const value = Number(form.get(name));
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(name);
  return value;
}

function moneyCents(form: FormData, name: string, min = 0) {
  const value = Number(form.get(name));
  const cents = Math.round(value * 100);
  if (!Number.isFinite(value) || !Number.isInteger(cents) || cents < min) throw new Error(name);
  return cents;
}

export async function saveInstantBookingPolicy(form: FormData): Promise<void> {
  const session = (await cookies()).get(OWNER_COOKIE_NAME)?.value;
  if (!verifyOwnerSessionToken(session)) redirect("/owner/access?next=/owner/settings");

  try {
    const taxPercent = Number(form.get("tax_percent"));
    if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 30) throw new Error("tax");

    const enabled = form.get("enabled") === "yes";
    const airbnbChannelGuarded = form.get("airbnb_channel_guarded") === "yes";
    const importCalendarReady = (process.env.KPL_AIRBNB_IMPORT_TOKEN?.trim().length ?? 0) >= 24;
    if (enabled && (!airbnbChannelGuarded || !importCalendarReady)) throw new Error("airbnb_channel_guard");

    await bookingClient().updateInstantSettings({
      enabled,
      base_nightly_cents: moneyCents(form, "base_nightly", 1),
      weekend_nightly_cents: moneyCents(form, "weekend_nightly", 1),
      cleaning_cents: moneyCents(form, "cleaning"),
      pet_fee_cents: moneyCents(form, "pet_fee"),
      pet_fee_mode: String(form.get("pet_fee_mode") ?? ""),
      tax_basis_points: Math.round(taxPercent * 100),
      taxable_fees: form.get("taxable_fees") === "yes",
      airbnb_channel_guarded: airbnbChannelGuarded,
      deposit_percent: wholeNumber(form, "deposit_percent", 1, 100),
      min_nights: wholeNumber(form, "min_nights", 1, 30),
      booking_window_days: wholeNumber(form, "booking_window_days", 1, 730),
      hold_minutes: wholeNumber(form, "hold_minutes", 60, 10_080),
      cancellation_terms: String(form.get("cancellation_terms") ?? "").trim(),
      balance_terms: String(form.get("balance_terms") ?? "").trim(),
    });
  } catch {
    redirect("/owner/settings?instant=error");
  }

  redirect("/owner/settings?instant=saved");
}
