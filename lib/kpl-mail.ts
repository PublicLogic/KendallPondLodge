import "server-only";

export type KplMailIdentity = {
  fromName: string;
  fromAddress: string;
  replyTo: string;
};

export type KplMailEvent =
  | "booking.request_received"
  | "booking.owner_alert"
  | "booking.quote_ready"
  | "booking.deposit_received"
  | "booking.confirmed";

const DEFAULT_FROM_NAME = "The Lodge at Kendall Pond";
const DEFAULT_FROM_ADDRESS = "info@publiclogic.org";

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function kplMailIdentity(): KplMailIdentity {
  const fromName = process.env.KPL_EMAIL_FROM_NAME?.trim() || DEFAULT_FROM_NAME;
  const configuredAddress =
    process.env.KPL_EMAIL_FROM_ADDRESS?.trim() ||
    process.env.KPL_BOOKING_CONTACT_EMAIL?.trim() ||
    DEFAULT_FROM_ADDRESS;
  const fromAddress = validEmail(configuredAddress)
    ? configuredAddress
    : DEFAULT_FROM_ADDRESS;

  const configuredReplyTo = process.env.KPL_EMAIL_REPLY_TO?.trim() || fromAddress;
  const replyTo = validEmail(configuredReplyTo) ? configuredReplyTo : fromAddress;

  return { fromName, fromAddress, replyTo };
}

export function publicLogicMailConfigured(): boolean {
  const endpoint = process.env.PUBLICLOGIC_MAIL_URL?.trim() || "";
  const key = process.env.PUBLICLOGIC_MAIL_KEY?.trim() || "";
  return /^https:\/\/[^/?#]+(?:\/[^?#]*)?$/.test(endpoint) && key.length >= 32;
}

export async function dispatchKplMail(
  event: KplMailEvent,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; status: "queued" | "not_configured" }> {
  if (!publicLogicMailConfigured()) {
    return { ok: false, status: "not_configured" };
  }

  const endpoint = process.env.PUBLICLOGIC_MAIL_URL!.trim();
  const key = process.env.PUBLICLOGIC_MAIL_KEY!.trim();
  const identity = kplMailIdentity();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      source: "kpl",
      event,
      identity,
      payload,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`PublicLogic Mail rejected KPL event: ${response.status}`);
  }

  return { ok: true, status: "queued" };
}
