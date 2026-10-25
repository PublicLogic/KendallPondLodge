/** Explicit one-time server-to-server registration; never runs during install/build. */
import { PjBookingClient } from '../lib/pj-booking-client.mjs';
if (!process.argv.includes('--apply')) {
    console.error('No change made. Load server environment, then run: npm run setup:calendar -- --apply');
    process.exit(2);
}
try {
    const url = process.env.KPL_AIRBNB_ICAL_URL?.trim();
    if (!url)
        throw new Error('KPL_AIRBNB_ICAL_URL is missing');
    const client = new PjBookingClient({ baseUrl: process.env.KPL_STORE_URL ?? '', key: process.env.KPL_STORE_KEY ?? '', allowLocal: process.env.NODE_ENV !== 'production' && process.env.KPL_ALLOW_LOCAL_PJ === 'true' });
    await client.registerCalendar(url);
    console.log('Calendar source registered with the property bound to this key. No booking or payment was created.');
}
catch (e) {
    console.error('Calendar registration failed:', e.code ?? 'configuration_or_connection_error');
    process.exitCode = 1;
}
