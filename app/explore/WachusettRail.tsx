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
        <p className={styles.eyebrow}>Getting here &amp; getting around</p>
        <h2 id="rail-title">There's a train to Boston.</h2>
        <p>
          The Fitchburg Line connects Wachusett Station in Fitchburg with
          Boston's North Station. The station is at 55 Authority Drive,
          not at the Lodge. You'll need to arrange your own ride between
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
        <h3>Next trains toward Boston</h3>
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
              ? "No upcoming departures in PJ's current feed. Check MBTA for a later trip."
              : "PuddleJumper's verified train feed isn't available here right now. Check MBTA directly for current times."}
          </p>
        )}
        <p className={styles.railFine}>
          {fresh
            ? <>PuddleJumper checked the MBTA feed {easternDate(transit!.checkedAt, {
                hour: "numeric", minute: "2-digit", timeZoneName: "short",
              })}. The board uses MBTA predictions when available and scheduled
              times otherwise. Check service alerts before traveling.</>
            : "Train times are intentionally hidden when PJ's feed is unavailable or stale; no times are estimated by the Lodge."}
        </p>
        {alerts.length > 0 && (
          <div className={styles.railAlerts}>
            <p className={styles.martName}>MBTA service notices</p>
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
