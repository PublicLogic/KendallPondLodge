'use client';

import { useMemo, useState } from 'react';

type ServerAction = (formData: FormData) => void | Promise<void>;

type Props = {
  action: ServerAction;
  unavailableDates: string[];
  today: string;
  availabilityReady: boolean;
};

type Month = {
  year: number;
  month: number;
};

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseIso(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function dateToIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const date = parseIso(value);
  date.setUTCDate(date.getUTCDate() + days);
  return dateToIso(date);
}

function nightsBetween(start: string, end: string) {
  return Math.round(
    (parseIso(end).getTime() - parseIso(start).getTime()) / 86400000,
  );
}

function shiftMonth(month: Month, offset: number): Month {
  const date = new Date(Date.UTC(month.year, month.month - 1 + offset, 1));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  };
}

function monthFromIso(value: string): Month {
  const date = parseIso(value);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  };
}

function monthKey(month: Month) {
  return month.year * 12 + month.month;
}

function monthTitle(month: Month) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(month.year, month.month - 1, 1)));
}

function formatSelectedDate(value: string | null) {
  if (!value) return 'Add date';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseIso(value));
}

function monthDays(month: Month) {
  const total = new Date(
    Date.UTC(month.year, month.month, 0),
  ).getUTCDate();

  const leading = new Date(
    Date.UTC(month.year, month.month - 1, 1),
  ).getUTCDay();

  const cells: Array<number | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: total }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function DateMonth({
  month,
  today,
  blocked,
  start,
  end,
  hover,
  selectingCheckout,
  disabled,
  onPick,
  onHover,
}: {
  month: Month;
  today: string;
  blocked: Set<string>;
  start: string | null;
  end: string | null;
  hover: string | null;
  selectingCheckout: boolean;
  disabled: boolean;
  onPick: (iso: string) => void;
  onHover: (iso: string | null) => void;
}) {
  const previewEnd =
    selectingCheckout && hover && start && hover > start
      ? hover
      : null;

  const rangeEnd = end ?? previewEnd;

  function rangeIsClear(checkIn: string, checkOut: string) {
    const nights = nightsBetween(checkIn, checkOut);

    if (nights < 1 || nights > 30) return false;

    for (let i = 0; i < nights; i += 1) {
      if (blocked.has(addDays(checkIn, i))) return false;
    }

    return true;
  }

  return (
    <section className="stay-calendar-month">
      <h3>{monthTitle(month)}</h3>

      <div className="stay-calendar-weekdays" aria-hidden="true">
        {weekdays.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="stay-calendar-days">
        {monthDays(month).map((day, index) => {
          if (day === null) {
            return (
              <span
                className="stay-calendar-empty"
                key={`empty-${index}`}
                aria-hidden="true"
              />
            );
          }

          const iso = isoDate(month.year, month.month, day);
          const blockedNight = blocked.has(iso);
          const past = iso <= today;

          let selectable = !disabled;

          if (selectable) {
            if (selectingCheckout && start) {
              selectable =
                iso > start &&
                rangeIsClear(start, iso);
            } else {
              selectable =
                !past &&
                !blockedNight;
            }
          }

          const selectedStart = iso === start;
          const selectedEnd = iso === end;
          const previewCheckout =
            !end && previewEnd === iso;

          const inRange =
            Boolean(start && rangeEnd) &&
            iso > start! &&
            iso < rangeEnd!;

          const checkoutOnly =
            selectingCheckout &&
            blockedNight &&
            selectable;

          let label = iso;

          if (blockedNight && !checkoutOnly) {
            label += ' unavailable';
          } else if (checkoutOnly) {
            label += ' available for checkout';
          } else if (selectedStart) {
            label += ' check-in';
          } else if (selectedEnd) {
            label += ' checkout';
          }

          return (
            <button
              aria-current={iso === today ? 'date' : undefined}
              aria-label={label}
              aria-pressed={selectedStart || selectedEnd}
              className={[
                'stay-calendar-day',
                past ? 'is-past' : '',
                blockedNight && !checkoutOnly ? 'is-blocked' : '',
                checkoutOnly ? 'is-checkout-only' : '',
                selectedStart ? 'is-selected is-start' : '',
                selectedEnd ? 'is-selected is-end' : '',
                selectedStart && Boolean(rangeEnd) ? 'is-range-start' : '',
                (selectedEnd || previewCheckout) && Boolean(start) ? 'is-range-end' : '',
                previewCheckout ? 'is-preview-end' : '',
                inRange ? 'is-range' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={!selectable}
              key={iso}
              onClick={() => onPick(iso)}
              onMouseEnter={() => onHover(selectable ? iso : null)}
              onMouseLeave={() => onHover(null)}
              type="button"
            >
              <span className="stay-calendar-day-number">{day}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function StayRequestForm({
  action,
  unavailableDates,
  today,
  availabilityReady,
}: Props) {
  const blocked = useMemo(
    () => new Set(unavailableDates),
    [unavailableDates],
  );

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState<Month>(
    monthFromIso(today),
  );

  const currentMonth = monthFromIso(today);
  const secondMonth = shiftMonth(viewMonth, 1);

  const selectingCheckout = Boolean(checkIn && !checkOut);

  const nights =
    checkIn && checkOut
      ? nightsBetween(checkIn, checkOut)
      : 0;

  function rangeIsClear(start: string, end: string) {
    const total = nightsBetween(start, end);

    if (total < 1 || total > 30) return false;

    for (let i = 0; i < total; i += 1) {
      if (blocked.has(addDays(start, i))) return false;
    }

    return true;
  }

  function pickDate(iso: string) {
    if (!availabilityReady) return;

    if (!checkIn || checkOut) {
      if (iso <= today || blocked.has(iso)) return;

      setCheckIn(iso);
      setCheckOut(null);
      setHover(null);
      return;
    }

    if (iso <= checkIn) {
      if (iso > today && !blocked.has(iso)) {
        setCheckIn(iso);
        setCheckOut(null);
        setHover(null);
      }

      return;
    }

    if (!rangeIsClear(checkIn, iso)) return;

    setCheckOut(iso);
    setHover(null);
  }

  function clearDates() {
    setCheckIn(null);
    setCheckOut(null);
    setHover(null);
  }

  const canGoBack =
    monthKey(viewMonth) > monthKey(currentMonth);

  return (
    <form
      action={action}
      className="booking-form booking-form-direct stay-request-form"
    >
      <input
        name="check_in"
        type="hidden"
        value={checkIn ?? ''}
      />

      <input
        name="check_out"
        type="hidden"
        value={checkOut ?? ''}
      />

      <div className="stay-date-picker">
        <div className="stay-date-summary">
          <div>
            <span>Check-in</span>
            <strong>{formatSelectedDate(checkIn)}</strong>
          </div>

          <div>
            <span>Checkout</span>
            <strong>{formatSelectedDate(checkOut)}</strong>
          </div>

          <div>
            <span>Stay</span>
            <strong>
              {nights > 0
                ? `${nights} night${nights === 1 ? '' : 's'}`
                : '—'}
            </strong>
          </div>

          {(checkIn || checkOut) && (
            <button
              className="stay-date-clear"
              onClick={clearDates}
              type="button"
            >
              Clear
            </button>
          )}
        </div>

        <div className="stay-calendar-nav">
          <button
            aria-label="Previous month"
            disabled={!canGoBack}
            onClick={() =>
              setViewMonth((month) => shiftMonth(month, -1))
            }
            type="button"
          >
            ←
          </button>

          <p aria-live="polite">
            {selectingCheckout
              ? 'Choose your checkout date'
              : checkIn && checkOut
                ? `${nights} night${nights === 1 ? '' : 's'} selected`
                : 'Choose your check-in date'}
          </p>

          <button
            aria-label="Next month"
            onClick={() =>
              setViewMonth((month) => shiftMonth(month, 1))
            }
            type="button"
          >
            →
          </button>
        </div>

        <div className="stay-calendar-months">
          <DateMonth
            blocked={blocked}
            disabled={!availabilityReady}
            end={checkOut}
            hover={hover}
            month={viewMonth}
            onHover={setHover}
            onPick={pickDate}
            selectingCheckout={selectingCheckout}
            start={checkIn}
            today={today}
          />

          <DateMonth
            blocked={blocked}
            disabled={!availabilityReady}
            end={checkOut}
            hover={hover}
            month={secondMonth}
            onHover={setHover}
            onPick={pickDate}
            selectingCheckout={selectingCheckout}
            start={checkIn}
            today={today}
          />
        </div>

        <div className="stay-calendar-key">
          <span>
            <i className="stay-key-open" />
            Available
          </span>

          <span>
            <i className="stay-key-selected" />
            Your stay
          </span>

          <span>
            <i className="stay-key-blocked" />
            Unavailable
          </span>
        </div>
      </div>

      <div className="booking-fields booking-guest-fields">
        <label>
          Guests
          <input
            defaultValue="2"
            max="8"
            min="1"
            name="guests"
            required
            type="number"
          />
        </label>

        <label>
          Pets
          <input
            defaultValue="0"
            max="2"
            min="0"
            name="pets"
            required
            type="number"
          />
        </label>

        <label>
          Name
          <input
            autoComplete="name"
            maxLength={100}
            name="guest_name"
            required
            type="text"
          />
        </label>

        <label>
          Email
          <input
            autoComplete="email"
            maxLength={254}
            name="guest_email"
            required
            type="email"
          />
        </label>
      </div>

      <label className="booking-note-field">
        Anything we should know? <span>(optional)</span>
        <textarea
          maxLength={1000}
          name="note"
          placeholder="Wedding, ski trip, sleeping setup, pet..."
        />
      </label>

      <div className="booking-honeypot" aria-hidden="true">
        <label>
          Website
          <input
            autoComplete="off"
            name="website"
            tabIndex={-1}
            type="text"
          />
        </label>
      </div>

      <label className="booking-check booking-check-direct">
        <input
          name="consent"
          required
          type="checkbox"
          value="yes"
        />

        <span>
          This is a request, not a reservation. Nate or Allie may
          contact me about the stay.
        </span>
      </label>

      <div className="booking-submit-row stay-submit-row">
        <button
          className="button button-primary"
          disabled={
            !availabilityReady ||
            !checkIn ||
            !checkOut
          }
          type="submit"
        >
          Request these dates
        </button>

        <small>
          {nights > 0
            ? `${nights} night${nights === 1 ? '' : 's'} · Full itemized quote before payment.`
            : 'Choose your dates first. No charge now.'}
        </small>
      </div>
    </form>
  );
}
