export const PAYMENT_WINDOW_MIN_MINUTES = 60;
export const PAYMENT_WINDOW_MAX_MINUTES = 10_080;

export function validPaymentWindow(minutes) {
  return Number.isSafeInteger(minutes) &&
    minutes >= PAYMENT_WINDOW_MIN_MINUTES &&
    minutes <= PAYMENT_WINDOW_MAX_MINUTES;
}
