import { localResourceLinks } from "./guide-data";
import type { PjExplore } from "./pjExplore";
import styles from "./explore.module.css";

function calendarDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
    timeZone: "America/New_York",
  }).format(new Date(iso + "T12:00:00Z"));
}

export function CommunityEvents({ feed }: { feed: PjExplore | null }) {
  const events = feed?.events ?? [];
  const verified = feed?.gardnerCalendarStatus === "available";
  return (
    <section className={styles.community} id="city-events" aria-labelledby="city-events-title">
      <div className={styles.communityInner}>
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Local events · PuddleJumper</p>
            <h2 id="city-events-title">What&apos;s on in Gardner.</h2>
          </div>
          <p>
            PJ brings together the public Gardner event calendar and the
            Lodge's sourced local listings. Check event details with each
            organizer before heading out.
          </p>
        </header>
        {events.length ? (
          <div className={styles.eventGrid}>
            {events.map(event => (
              <article className={styles.event} key={event.id}>
                <time dateTime={event.date}>{calendarDate(event.date)}</time>
                <h3>{event.title}</h3>
                <p>{event.description || event.location}</p>
                <div className={styles.eventMeta}>
                  <span>{event.location}</span>
                  <a href={event.url} target="_blank" rel="noopener noreferrer">
                    {event.sourceName} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.eventEmpty}>
            {feed
              ? verified
                ? "There are no upcoming events in PJ's current listing. Check the official calendars for more."
                : "PJ's Gardner calendar isn't available right now. Use the official event calendars for your dates."
              : "PJ's event feed isn't available here right now. You can still find current listings on the official calendars."}
          </p>
        )}
        {events.length > 0 && !verified && (
          <p className={styles.eventNote}>
            The City calendar refresh is currently unavailable; these are the
            separately sourced events PJ still has on record. Confirm details
            with the organizer.
          </p>
        )}
        <div className={styles.eventLinks}>
          <a href="https://www.gardner-ma.gov/calendar.aspx" target="_blank" rel="noopener noreferrer">
            City of Gardner calendar <span aria-hidden="true">↗</span>
          </a>
          <a href={localResourceLinks.chamberEvents} target="_blank" rel="noopener noreferrer">
            Greater Gardner Chamber events <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
