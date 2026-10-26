import 'server-only';
import { PjBookingClient, legacyBookingCall } from './pj-booking-client.mjs';
export { BookingServiceError, publicError } from './pj-booking-client.mjs';
export type Booking = {
 id:string; quote_token:string; created_at:string; check_in:string; check_out:string;
 guest_name:string; guest_email:string; guests:number; pets:number; note:string;
 status:'requested'|'quoted'|'checkout'|'confirmed'|'expired'|'declined';
 nightly_cents:number|null; cleaning_cents:number|null; pet_cents:number|null; tax_cents:number|null;
 other_cents:number|null; other_label:string|null; deposit_cents:number|null; total_cents:number|null;
 cancellation_terms:string|null; balance_terms:string|null; quote_expires:string|null;
 stripe_session_id:string|null; accepted_at:string|null; paid_at:string|null; checkout_started_at:string|null;
 refund_reason:string|null; reservation_sync_error:string|null;
};
export function bookingClient() {
 return new PjBookingClient({baseUrl:process.env.KPL_STORE_URL??'',key:process.env.KPL_STORE_KEY??'',allowLocal:process.env.NODE_ENV!=='production'&&process.env.KPL_ALLOW_LOCAL_PJ==='true'});
}
export function bookingConfigured(){try{bookingClient();return true}catch{return false}}
/** Public requests do not require a Stripe key or a customer login. Payment readiness is separate. */
export function directBookingEnabled(){return process.env.KPL_DIRECT_BOOKING_ENABLED==='true'&&bookingConfigured()}
export function paymentConfigured(){return bookingConfigured()&&/^(sk|rk)_(test|live)_/.test(process.env.STRIPE_SECRET_KEY??'')&&!!process.env.STRIPE_WEBHOOK_SECRET&&/^https:\/\/[^/?#]+$/.test(process.env.KPL_BOOKING_ORIGIN??'')}
export async function findQuote(token:string):Promise<Booking|null>{return bookingClient().findQuote(token) as Promise<Booking|null>}
export function usd(cents:number){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100)}
export function hostContactHref(){const email=process.env.KPL_BOOKING_CONTACT_EMAIL??'';return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?`mailto:${encodeURIComponent(email)}`:'https://www.airbnb.com/rooms/1667597913565948713'}

/** Existing KPL calls use a closed compatibility map; no Supabase requests. */
export async function bookingDb<T>(path: string, init: {method?: string; body?: unknown; returnRows?: boolean} = {}): Promise<T> {
  return legacyBookingCall(bookingClient(), path, init) as Promise<T>;
}
export type BookingAttention = {
 generated_at:string; counts:Record<string,number>; open_reconciliation:number; audit_outbox_pending:number;
 items:Array<{id?:string;booking_id?:string;booking_request_id?:string;check_in?:string;check_out?:string;status?:string;
 problems:Array<{code:string;severity:'action'|'todo'|'info';message:string}>}>;
};
export async function bookingAttention(): Promise<BookingAttention> { return bookingClient().attention(); }


export type BookingMessageState = {
 kind:'request_guest'|'request_owner'|'quote_guest'|'confirmed_guest'|'confirmed_owner';
 status:string;
 hold_reason:string|null;
 sent_at:string|null;
 verification:string;
 provider_accepted:boolean;
};

export type BookingMessagingStatus = {
 readiness:{
   enabled:boolean;
   sender_authorized:boolean;
   provider_connected:boolean;
   owner_recipients:number;
   public_base_configured:boolean;
 };
 bookings:Record<string,Partial<Record<BookingMessageState['kind'],BookingMessageState>>>;
};

export async function bookingMessageStatus():Promise<BookingMessagingStatus>{
 return bookingClient().messageStatus() as Promise<BookingMessagingStatus>;
}
