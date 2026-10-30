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
            <h2 id="city-events-title">What’s going on.</h2>
          </div>
          <p>
            Want to know what's on while you're here? These are the local listings we can pull in. Check with the organizer for times and changes.
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
                ? "Nothing coming up in the latest listings. The City and Chamber calendars are below."
                : "We can't reach the City calendar right now. Try the links below."
              : "Events aren't loading right now. The City and Chamber calendars are below."}
          </p>
        )}
        {events.length > 0 && !verified && (
          <p className={styles.eventNote}>
            The City calendar couldn't be refreshed. These other listings may still
            be useful, but check with the organizer before you go.
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
