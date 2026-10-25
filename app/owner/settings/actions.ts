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
