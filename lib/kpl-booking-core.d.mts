import type { Booking } from './booking-db';
export function stayNights(checkIn: string, checkOut: string): number;
export function propertyToday(now?: Date): string;
export function validateGuestRequest(raw: Record<string, unknown>, now?: Date): {
 check_in: string; check_out: string; guest_name: string; guest_email: string;
 guests: number; pets: number; note: string; request_key?: string;
};
export function publicBookingState(booking: Booking, payment?: string): 'refund_review'|'confirmed'|'needs_attention'|'checking'|'expired'|'quote';
export function beginGuestCheckout(options: {
 token: string; accepted: boolean; origin: string;
 pj: {beginCheckout(token: string): Promise<any>; attachCheckout(id: string, session: string): Promise<any>};
 stripe: (path: string, form?: URLSearchParams, key?: string) => Promise<any>;
}): Promise<{kind: 'checking'|'redirect'; url: string}>;
export function verifyPaymentSignature(body: string, signature: string|null, secret: string, now?: number): boolean;
export function handlePaymentWebhook(options: {
 body: string; signature: string|null; env: Record<string,string|undefined>;
 pj: {confirmPayment(id: string, session: string, amount: number): Promise<any>};
}): Promise<{status: number; body: Record<string,unknown>; outcome?: string}>;
