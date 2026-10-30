import { localResourceLinks } from "./guide-data";
import styles from "./explore.module.css";

type MbtaSchedule = {
  attributes?: {
    departure_time?: string | null;
    direction_id?: number | null;
  };
  relationships?: {
    route?: { data?: { id?: string } | null };
  };
};

type Departure = {
  iso: string;
  label: string;
};

function easternDate(value: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    ...options,
  }).format(value);
}

/**
 * Read only scheduled Fitchburg Line departures from the MBTA V3 API.
 * Do not treat a schedule as a live prediction, and never invent times if
 * the feed is unavailable. This fetch is cached briefly to protect the API.
 * Source: https://api-v3.mbta.com/; stop place-FR-3338 is Wachusett.
 */
async function nextBostonDepartures(): Promise<Departure[] | null> {
  try {
    const endpoint = new URL("https://api-v3.mbta.com/schedules");
    endpoint.searchParams.set("filter[stop]", "place-FR-3338");
    endpoint.searchParams.set("filter[route]", "CR-Fitchburg");
    endpoint.searchParams.set("filter[direction_id]", "1");
    endpoint.searchParams.set("sort", "departure_time");
    endpoint.searchParams.set("page[limit]", "40");

    const headers: Record<string, string> = { Accept: "application/vnd.api+json" };
    if (process.env.MBTA_API_KEY) headers["x-api-key"] = process.env.MBTA_API_KEY;

    const response = await fetch(endpoint, {
      headers,
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(4500),
    });
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("data" in payload)) return null;
    const rows = (payload as { data?: unknown }).data;
    if (!Array.isArray(rows)) return null;

    const now = Date.now();
    const future = (rows as MbtaSchedule[])
      .filter(row => row?.attributes?.direction_id === 1 && row?.relationships?.route?.data?.id === "CR-Fitchburg")
      .map(row => row.attributes?.departure_time)
      .filter((value): value is string => typeof value === "string")
      .map(iso => ({ iso, millis: Date.parse(iso) }))
      .filter(row => Number.isFinite(row.millis) && row.millis >= now && row.millis < now + 30 * 60 * 60 * 1000)
      .sort((a, b) => a.millis - b.millis)
      .slice(0, 3);

    return future.map(({ iso }) => ({
      iso,
      label: easternDate(new Date(iso), { weekday: "short", hour: "numeric", minute: "2-digit" }),
    }));
  } catch {
    return null;
  }
}

export async function WachusettRail() {
  const trains = await nextBostonDepartures();

  return (
    <section className={styles.rail} id="train" aria-labelledby="rail-title">
      <div className={styles.railCopy}>
        <p className={styles.eyebrow}>Getting here &amp; getting around</p>
        <h2 id="rail-title">There&apos;s a train to Boston.</h2>
        <p>
          The Fitchburg Line connects Wachusett Station in Fitchburg with
          Boston&apos;s North Station. The station is at 55 Authority Drive,
          not at the Lodge. You&apos;ll need to arrange your own ride between
          the house and the station.
        </p>
        <div className={styles.railLinks}>
          <a href={localResourceLinks.fitchburgLine} target="_blank" rel="noopener noreferrer">
            MBTA train schedule <span aria-hidden="true">↗</span>
          </a>
          <a href={localResourceLinks.wachusettStation} target="_blank" rel="noopener noreferrer">
            Wachusett Station details <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className={styles.railBoard}>
        <div className={styles.boardTitle}>
          <span>Wachusett → North Station</span>
          <span>Fitchburg Line</span>
        </div>
        <h3>Next scheduled trains toward Boston</h3>
        {trains && trains.length ? (
          <ol className={styles.departures}>
            {trains.map(train => (
              <li key={train.iso}>
                <time dateTime={train.iso}>{train.label}</time>
                <span>Scheduled · not a live estimate</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.railUnavailable}>
            No verified departure times to display right now.
            Use the MBTA schedule for your travel date.
          </p>
        )}
        <p className={styles.railFine}>
          Scheduled times are from the MBTA when available, shown in Eastern Time.
          They are not live predictions. Check service alerts and the return
          train before traveling.
        </p>
        <div className={styles.mart}>
          <p className={styles.martName}>Gardner connection · MART</p>
          <p>
            MART also runs a fare-free Gardner–Wachusett commuter shuttle
            on weekdays, excluding holidays. It serves Gardner City Hall
            and the Gardner Intermodal Center, <em>not the Lodge</em>.
          </p>
          <a href={localResourceLinks.martShuttle} target="_blank" rel="noopener noreferrer">
            MART shuttle schedule and pickup details <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
