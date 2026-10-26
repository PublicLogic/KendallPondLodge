// Reads the Airbnb iCal export (KPL_AIRBNB_ICAL_URL) to check real-world
// availability before a direct-booking quote is issued or paid. Ported from
// kpl-direct-book's lib/ical.ts. Recognized owner blocks are distinct from
// reservation/unknown events; unknown summaries are treated as conflicts.
//
// Fails closed: every function that touches the network throws on a missing
// URL, a network error, or a non-2xx response, instead of silently treating
// the calendar as empty. Callers must treat a thrown error as "could not
// verify availability" and refuse to proceed, never as "assume available".

const CACHE_TTL_MS = 5 * 60 * 1000;
const OWNER_BLOCK_SUMMARIES = new Set(['Airbnb (Not available)']);

// Module-level cache for ordinary reads. Quote and payment actions bypass it.
// A fresh serverless/worker instance misses the cache. Never log the feed URL.
let cache = { text: null, fetchedAt: 0 };

/** Returns only whether the private Airbnb calendar source is configured. */
export function airbnbCalendarConfigured() {
  return Boolean(process.env.KPL_AIRBNB_ICAL_URL?.trim());
}

function toIsoDate(value) {
  // DTSTART/DTEND can appear as `;VALUE=DATE:YYYYMMDD` or as a date-time
  // (`:YYYYMMDDTHHMMSSZ`, optionally with a TZID parameter before the last
  // colon). Only the leading YYYYMMDD digits matter for a nightly stay.
  const match = value.trim().match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;
  const iso = `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso ? iso : null;
}

function addDays(isoDate, days) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const ms = Date.UTC(year, month - 1, day + days);
  return new Date(ms).toISOString().slice(0, 10);
}

/** Parses a raw .ics feed into `{ start, end, summary }` events (DTEND exclusive, as iCal defines it). */
export function parseIcsEvents(ics) {
  const events = [];
  // Unfold RFC 5545 §3.1 continuation lines before splitting.
  const lines = ics.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  let start = null;
  let end = null;
  let summary = null;
  let inEvent = false;
  let sawEndDate = false;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      if (inEvent) throw new Error('Airbnb calendar format is invalid.');
      inEvent = true;
      start = end = summary = null;
      sawEndDate = false;
    }
    else if (line.startsWith('DTSTART')) start = toIsoDate(line.split(':').pop());
    else if (line.startsWith('DTEND')) {
      sawEndDate = true;
      end = toIsoDate(line.split(':').pop());
    }
    else if (line.startsWith('SUMMARY')) summary = line.slice(line.indexOf(':') + 1).trim();
    else if (line === 'END:VEVENT') {
      if (!inEvent || !start || (sawEndDate && !end) || (end && end <= start)) throw new Error('Airbnb calendar format is invalid.');
      events.push({ start, end: end ?? addDays(start, 1), summary: summary ?? '' });
      inEvent = false;
    }
  }
  if (inEvent) throw new Error('Airbnb calendar format is invalid.');
  return events;
}

function nightsOf(event) {
  const nights = [];
  for (let d = event.start; d < event.end; d = addDays(d, 1)) nights.push(d);
  return nights;
}

/** Every night blocked on Airbnb for any reason: a real reservation or a manual "not available" block. */
export function blockedNightsFromIcs(ics) {
  const out = new Set();
  for (const event of parseIcsEvents(ics)) for (const night of nightsOf(event)) out.add(night);
  return out;
}

/** Treat every event except a recognized owner block as a reservation conflict. */
export function reservedNightsFromIcs(ics) {
  const out = new Set();
  for (const event of parseIcsEvents(ics)) {
    if (OWNER_BLOCK_SUMMARIES.has(event.summary)) continue;
    for (const night of nightsOf(event)) out.add(night);
  }
  return out;
}

/** Free for a new quote, owner-blocked for payment, or a partial/conflicting hold. */
export function airbnbStayStatus(ics, requestedNights) {
  const wanted = new Set(requestedNights);
  const ownerBlocked = new Set();
  for (const event of parseIcsEvents(ics)) {
    for (const night of nightsOf(event)) {
      if (!wanted.has(night)) continue;
      if (!OWNER_BLOCK_SUMMARIES.has(event.summary)) return 'conflict';
      ownerBlocked.add(night);
    }
  }
  if (ownerBlocked.size === 0) return 'free';
  return ownerBlocked.size === wanted.size ? 'owner-blocked' : 'partial';
}

/** Test-only: clears the in-module cache so each test starts from a clean slate. */
export function resetAirbnbIcsCacheForTests() {
  cache = { text: null, fetchedAt: 0 };
}

/** Fetches a validated Airbnb feed. Fresh calls bypass the five-minute cache. */
export async function fetchAirbnbIcs({ now = Date.now(), fetchImpl = fetch, fresh = false } = {}) {
  if (!fresh && cache.text !== null && now - cache.fetchedAt < CACHE_TTL_MS) return cache.text;
  const url = process.env.KPL_AIRBNB_ICAL_URL?.trim();
  if (!url) throw new Error('KPL_AIRBNB_ICAL_URL is not configured; cannot verify Airbnb availability.');
  let response;
  try {
    response = await fetchImpl(url);
  } catch {
    // Never include the caught error: it can echo the private feed URL.
    throw new Error('Airbnb calendar fetch failed (network).');
  }
  if (!response.ok) throw new Error(`Airbnb calendar fetch failed (${response.status}).`);
  const text = await response.text();
  if (!/^BEGIN:VCALENDAR\s*$/m.test(text) || !/^END:VCALENDAR\s*$/m.test(text)) {
    throw new Error('Airbnb calendar format is invalid.');
  }
  parseIcsEvents(text);
  cache = { text, fetchedAt: now };
  return text;
}

/** All Airbnb-blocked nights (reservations + manual blocks), fetched fresh or from the 5-minute cache. */
export async function airbnbBlockedNights(options) {
  return blockedNightsFromIcs(await fetchAirbnbIcs(options));
}

/** Only nights with a real Airbnb reservation, fetched fresh or from the 5-minute cache. */
export async function airbnbReservedNights(options) {
  return reservedNightsFromIcs(await fetchAirbnbIcs(options));
}
