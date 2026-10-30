import { localResourceLinks } from "./guide-data";
import type { PjTransit } from "./pjExplore";
import styles from "./explore.module.css";

function easternDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    ...options,
  }).format(new Date(value));
}

/** The train provider is PJ, not a duplicate MBTA integration in KPL. */
export function WachusettRail({ transit }: { transit: PjTransit | null }) {
  const now = Date.now();
  const checked = transit ? Date.parse(transit.checkedAt) : NaN;
  const fresh = transit?.status === "available" &&
    Number.isFinite(checked) && checked <= now + 60_000 &&
    checked >= now - 10 * 60_000;

  const departures = fresh ? transit.departures
    .filter(train => {
      const when = Date.parse(train.expected ?? train.scheduled);
      return Number.isFinite(when) && when >= now - 60_000 &&
        when < now + 30 * 60 * 60_000;
    })
    .slice(0, 3) : [];
  const alerts = fresh && transit.alertsAvailable ? transit.alerts.slice(0, 2) : [];

  return (
    <section className={styles.rail} id="train" aria-labelledby="rail-title">
      <div className={styles.railCopy}>
        <p className={styles.eyebrow}>By train</p>
        <h2 id="rail-title">Take the train.</h2>
        <p>
          Catch the Fitchburg Line toward Boston&apos;s North Station at Wachusett
          Station, 55 Authority Drive in Fitchburg. You&apos;ll need a ride
          between the station and the Lodge.
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
        <h3>Heading into Boston?</h3>
        {departures.length ? (
          <ol className={styles.departures}>
            {departures.map(train => {
              const predicted = transit?.predictionsAvailable === true &&
                train.expected !== null;
              const when = predicted ? train.expected! : train.scheduled;
              return (
                <li key={train.id + train.scheduled}>
                  <time dateTime={when}>
                    {easternDate(when, { weekday: "short", hour: "numeric", minute: "2-digit" })}
                  </time>
                  <span>{predicted ? "MBTA predicted departure" : "Scheduled departure"}</span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className={styles.railUnavailable}>
            {fresh
              ? "Nothing heading toward Boston in this update. Check the full MBTA timetable."
              : "Train times aren&apos;t coming through right now. Use the MBTA schedule above."}
          </p>
        )}
        {fresh && (
          <p className={styles.railFine}>
            Updated {easternDate(transit!.checkedAt, {
              hour: "numeric", minute: "2-digit", timeZoneName: "short",
            })}. We show MBTA predictions when available, or the scheduled time
            otherwise. Check service alerts before you leave.
          </p>
        )}
        {alerts.length > 0 && (
          <div className={styles.railAlerts}>
            <p className={styles.martName}>Service alerts</p>
            {alerts.map(alert => (
              <a key={alert.id || alert.url} href={alert.url}
                target="_blank" rel="noopener noreferrer">
                {alert.title} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}
        <div className={styles.mart}>
          <p className={styles.martName}>Gardner connection · MART</p>
          <p>
            MART also has a free weekday shuttle from Gardner to Wachusett Station
            (except holidays). It stops at City Hall and the Intermodal
            Center, not at the Lodge.
          </p>
          <a href={localResourceLinks.martShuttle} target="_blank" rel="noopener noreferrer">
            MART shuttle timetable <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
