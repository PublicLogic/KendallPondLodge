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
            <p className={styles.eyebrow}>Gardner&apos;s calendar</p>
            <h2 id="city-events-title">What&apos;s on around town.</h2>
          </div>
          <p>
            Gardner&apos;s public calendar and other local event listings.
            See something you like? Check the details with the organizer
            before you head out.
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
                ? "Nothing coming up in the current listing. The calendars below may have more."
                : "The City calendar isn&apos;t coming through. Try the links below."
              : "No event listings are loading. The official calendars are linked below."}
          </p>
        )}
        {events.length > 0 && !verified && (
          <p className={styles.eventNote}>
            The City feed isn&apos;t updating, but these other local listings
            are still available. Check the dates with the organizer.
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
