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
            <p className={styles.eyebrow}>Local events</p>
            <h2 id="city-events-title">On the calendar.</h2>
          </div>
          <p>
            Upcoming events from Gardner&apos;s city calendar and other
            local sources. Dates and details can change; check with
            the organizer before going.
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
                ? "No upcoming events listed at the moment. Check the calendars below for more."
                : "The City calendar isn&apos;t updating here right now. Use the calendars below."
              : "Events aren&apos;t loading here right now. Check the calendars below."}
          </p>
        )}
        {events.length > 0 && !verified && (
          <p className={styles.eventNote}>
            The City calendar is temporarily unavailable. These listings
            come from other local sources; confirm details with the organizer.
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
