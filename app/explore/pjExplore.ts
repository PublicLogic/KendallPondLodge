import "server-only";

/**
 * KPL consumes the already-built, property-published STAYOS projection.
 *
 * PJ owns MBTA schedules + predictions + alerts, Gardner public-calendar
 * ingestion, source custody and public/owner separation. Never fetch MBTA
 * directly from the website and never send KPL_STORE_KEY to this public route.
 *
 * PJ contract (PublicLogic/PuddleJumper):
 * GET /api/stayos/content/public/explore -> payload of explore:published
 * PJ mounts that route only when STAYOS_KPL_WORKSPACE_ID is configured.
 */
export type PjTransitDeparture = {
  id: string;
  destination: string;
  scheduled: string;
  expected: string | null;
  status: string | null;
};

export type PjTransitAlert = {
  id: string;
  title: string;
  url: string;
};

export type PjTransit = {
  status: "available" | "unavailable";
  source: "MBTA V3";
  checkedAt: string;
  lastSuccessfulAt: string | null;
  predictionsAvailable: boolean;
  alertsAvailable: boolean;
  departures: PjTransitDeparture[];
  alerts: PjTransitAlert[];
};

export type PjExploreEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  sourceName: string;
  url: string;
};

export type PjExplore = {
  transit: PjTransit | null;
  events: PjExploreEvent[];
  gardnerCalendarStatus: "available" | "unavailable";
  updatedAt: string | null;
};

type JsonObject = Record<string, unknown>;
const validObject = (x: unknown): x is JsonObject =>
  typeof x === "object" && x !== null && !Array.isArray(x);

function text(x: unknown, max = 200): string {
  return typeof x === "string" ? x.slice(0, max).trim() : "";
}

function validDateTime(x: unknown): x is string {
  return typeof x === "string" && /^\d{4}-\d{2}-\d{2}T/.test(x) &&
    Number.isFinite(Date.parse(x));
}

function safePublicLink(x: unknown): string | null {
  if (typeof x !== "string") return null;
  try {
    const u = new URL(x);
    const hosts = [
      "gardner-ma.gov",
      "www.gardner-ma.gov",
      "business.gardnerma.com",
      "www.visitnorthcentral.com",
      "visitnorthcentral.com",
    ];
    return u.protocol === "https:" && hosts.includes(u.hostname) &&
      !u.username && !u.password && !u.port ? u.href : null;
  } catch {
    return null;
  }
}

function localToday() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseTransit(raw: unknown): PjTransit | null {
  if (!validObject(raw)) return null;
  const checkedAt = text(raw.checkedAt, 50);
  if (!validDateTime(checkedAt)) return null;
  const status = raw.status === "available" ? "available" : "unavailable";
  const departures = Array.isArray(raw.departures)
    ? raw.departures
        .filter(validObject)
        .slice(0, 30)
        .flatMap((row): PjTransitDeparture[] => {
          if (!validDateTime(row.scheduled)) return [];
          const expected = validDateTime(row.expected) ? row.expected : null;
          return [{
            id: text(row.id, 120),
            destination: text(row.destination, 120) || "Boston · North Station",
            scheduled: row.scheduled,
            expected,
            status: text(row.status, 120) || null,
          }];
        })
    : [];
  const alerts = Array.isArray(raw.alerts)
    ? raw.alerts
        .filter(validObject)
        .slice(0, 10)
        .flatMap((row): PjTransitAlert[] => {
          const url = typeof row.url === "string" ? row.url : "";
          if (!url.startsWith("https://www.mbta.com/")) return [];
          return [{ id: text(row.id, 120), title: text(row.title, 300), url }];
        })
    : [];
  return {
    status,
    source: "MBTA V3",
    checkedAt,
    lastSuccessfulAt: validDateTime(raw.lastSuccessfulAt) ? raw.lastSuccessfulAt : null,
    predictionsAvailable: raw.predictionsAvailable === true,
    alertsAvailable: raw.alertsAvailable === true,
    departures,
    alerts,
  };
}

function parseEvents(raw: unknown): PjExploreEvent[] {
  if (!Array.isArray(raw)) return [];
  const today = localToday(), now = Date.now();
  const seen = new Set<string>();
  return raw.filter(validObject)
    .slice(0, 250)
    .flatMap((item): PjExploreEvent[] => {
      if (item.type !== "event" || !/^\d{4}-\d{2}-\d{2}$/.test(text(item.date, 10))) return [];
      const date = text(item.date, 10);
      const calendarDay = new Date(date + "T12:00:00Z");
      if (!Number.isFinite(calendarDay.getTime()) ||
        calendarDay.toISOString().slice(0, 10) !== date || date < today) return [];
      if (validDateTime(item.expiresAt) && Date.parse(item.expiresAt) <= now) return [];
      const url = safePublicLink(item.href);
      const title = text(item.title, 150);
      if (!url || !title) return [];
      const id = text(item.id, 120);
      if (seen.has(id || url)) return [];
      seen.add(id || url);
      return [{
        id: id || url,
        title,
        description: text(item.description, 300),
        date,
        location: text(item.location, 120),
        sourceName: text(item.sourceName, 120) || "Local event organizer",
        url,
      }];
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
}

/** Empty / unconfigured PJ -> null. Never fabricate schedules or events. */
export async function loadPjExplore(): Promise<PjExplore | null> {
  const base = process.env.KPL_STORE_URL?.trim();
  if (!base) return null;
  try {
    const configured = new URL(base);
    if (configured.protocol !== "https:" || configured.username ||
      configured.password || configured.search || configured.hash ||
      configured.pathname.replace(/\/+$/, "") !== "/api/stayos/booking") return null;

    const url = new URL("/api/stayos/content/public/explore", configured);
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      redirect: "error",
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4500),
    });
    if (!response.ok || Number(response.headers.get("content-length") || 0) > 800_000)
      return null;

    const payload: unknown = await response.json();
    if (!validObject(payload) || !Array.isArray(payload.items)) return null;
    const calendars = Array.isArray(payload.calendars) ? payload.calendars : [];
    const gardner = calendars.find((c: unknown) => validObject(c) &&
      c.name === "Gardner Community Events") as JsonObject | undefined;
    return {
      transit: parseTransit(payload.transit),
      events: parseEvents(payload.items),
      gardnerCalendarStatus: gardner?.status === "available" ? "available" : "unavailable",
      updatedAt: validDateTime(payload.updatedAt) ? payload.updatedAt : null,
    };
  } catch {
    return null;
  }
}
