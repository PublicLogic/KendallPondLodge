import { bookingMessageStatus } from '@/lib/booking-db';
export const dynamic = 'force-dynamic';
export default async function RehearsalStatus() {
 const status = await bookingMessageStatus();
 return <main><h1>Staging email delivery</h1><p>Read-only test environment diagnostics.</p><pre>{JSON.stringify(status, null, 2)}</pre></main>;
}
