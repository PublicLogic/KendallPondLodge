const ACTIVE = new Set(['checkout', 'confirmed']);

function esc(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function stamp(value) {
  const date = new Date(value);
  const safe = Number.isNaN(date.getTime()) ? new Date(0) : date;
  return safe.toISOString().replace(/[-:]/g, '').replace('.000', '');
}

export function buildDirectBookingCalendar(bookings, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const events = (Array.isArray(bookings) ? bookings : [])
    .filter((booking) => ACTIVE.has(booking?.status) && /^\d{4}-\d{2}-\d{2}$/.test(booking?.check_in ?? '') && /^\d{4}-\d{2}-\d{2}$/.test(booking?.check_out ?? '') && booking.check_out >= today)
    .map((booking) => [
      'BEGIN:VEVENT',
      'UID:' + esc(booking.id) + '@kendallpondlodge.com',
      'DTSTAMP:' + stamp(booking.created_at),
      'DTSTART;VALUE=DATE:' + booking.check_in.replaceAll('-', ''),
      'DTEND;VALUE=DATE:' + booking.check_out.replaceAll('-', ''),
      'SUMMARY:Reserved',
      'TRANSP:OPAQUE',
      'END:VEVENT',
    ].join('\r\n'));

  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PublicLogic//KPL Direct Booking//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Kendall Pond Lodge Direct Bookings',...events,'END:VCALENDAR',''].join('\r\n');
}
