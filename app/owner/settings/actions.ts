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

  try {
    const url = process.env.KPL_AIRBNB_ICAL_URL?.trim();
    if (!url) redirect("/owner/settings?calendar=missing");

    const ics = await fetchAirbnbIcs({ fresh: true });
    const events = parseIcsEvents(ics);

    await bookingClient().registerCalendar(url);
    const status = await bookingClient().contentStatus();

    if (!status.calendarConfigured) {
      redirect("/owner/settings?calendar=unverified");
    }

    redirect("/owner/settings?calendar=registered&events=" + Math.min(events.length, 9999));
  } catch {
    redirect("/owner/settings?calendar=error");
  }
}
