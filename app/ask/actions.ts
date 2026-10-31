"use server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type QuestionResult =
  | { received: true }
  | { received: false; message: string };

export async function submitGuestQuestion(form: FormData): Promise<QuestionResult> {
  const guest_name = String(form.get("guest_name") ?? "").trim();
  const guest_email = String(form.get("guest_email") ?? "").trim().toLowerCase();
  const message = String(form.get("message") ?? "").trim();
  const check_in = String(form.get("check_in") ?? "").trim();
  const check_out = String(form.get("check_out") ?? "").trim();
  const client_request_id = String(form.get("client_request_id") ?? "").trim();
  if (String(form.get("website") ?? "").trim()) {
    return { received: false, message: "We couldn't send that question. Please contact us directly." };
  }
  if (guest_name.length < 2 || guest_name.length > 100 ||
      guest_email.length > 254 || !EMAIL.test(guest_email) ||
      message.length < 1 || message.length > 4000 || !UUID.test(client_request_id) ||
      Boolean(check_in) !== Boolean(check_out) ||
      (check_in && (!/^\d{4}-\d{2}-\d{2}$/.test(check_in) || !/^\d{4}-\d{2}-\d{2}$/.test(check_out) || check_out <= check_in))) {
    return { received: false, message: "Please check your name, email, dates and question, then try again." };
  }
  const key = process.env.KPL_STORE_KEY?.trim();
  const base = process.env.KPL_STORE_URL?.trim();
  if (!key || !base) {
    return { received: false, message: "Online questions are temporarily unavailable. Please contact us directly." };
  }
  let url: URL;
  try {
    url = new URL(base);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
        !url.pathname.endsWith("/api/stayos/booking") || url.port) throw Error("invalid configuration");
    url.pathname = "/api/stayos/inquiries";
  } catch {
    return { received: false, message: "Online questions are temporarily unavailable. Please contact us directly." };
  }

  try {
    const response = await fetch(url.href, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-PuddleJumper-Request": "true",
      },
      body: JSON.stringify({
        guest_name, guest_email, message,
        source: "rates",
        client_request_id,
        ...(check_in ? { check_in, check_out } : {}),
      }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return { received: false, message: "We couldn't send that question right now. Please contact us directly." };
    const payload = await response.json() as {success?:boolean; data?:{inquiry?:{id?:string}}};
    if (payload.success !== true || !payload.data?.inquiry?.id) {
      return { received: false, message: "We couldn't confirm your question was saved. Please contact us directly." };
    }
    return { received: true };
  } catch {
    // Never log guest details, credentials or private inquiry links.
    return { received: false, message: "We couldn't reach our message service. Please contact us directly." };
  }
}
