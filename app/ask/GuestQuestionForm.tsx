"use client";

import { useRef, useState, type FormEvent } from "react";
import { submitGuestQuestion } from "./actions";

export function GuestQuestionForm({ contactHref }: { contactHref: string }) {
  const [sending, setSending] = useState(false);
  const [received, setReceived] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef<string>("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    if (!requestId.current) requestId.current = crypto.randomUUID();
    const form = new FormData(event.currentTarget);
    form.set("client_request_id", requestId.current);
    setSending(true);
    setError("");
    try {
      const result = await submitGuestQuestion(form);
      if (result.received) {
        setReceived(true);
        requestId.current = "";
      } else {
        setError(result.message);
      }
    } catch {
      setError("We couldn't reach the message service. Please contact us directly.");
    } finally {
      setSending(false);
    }
  }

  if (received) {
    return <div className="booking-panel" role="status">
      <h2>Your question is saved.</h2>
      <p>Thanks for reaching out. We have your note and can follow up using the email you provided. This does not reserve any dates or charge you.</p>
      <button type="button" className="button button-secondary" onClick={()=>setReceived(false)}>Ask another question</button>
    </div>;
  }

  return <form action={undefined} onSubmit={submit} className="booking-form booking-form-direct">
    <div className="booking-fields booking-guest-fields">
      <label>Your name <input type="text" name="guest_name" autoComplete="name" minLength={2} maxLength={100} required /></label>
      <label>Email for a reply <input type="email" name="guest_email" autoComplete="email" maxLength={254} required /></label>
      <label>Check-in (optional) <input type="date" name="check_in" /></label>
      <label>Checkout (optional) <input type="date" name="check_out" /></label>
    </div>
    <label className="booking-note-field">
      What can we help with?
      <textarea name="message" maxLength={4000} required rows={5} placeholder="Tell us what you have in mind."></textarea>
    </label>
    <div className="booking-honeypot" aria-hidden="true">
      <label>Website <input type="text" name="website" autoComplete="off" tabIndex={-1}/></label>
    </div>
    <p className="booking-fine">No payment, no reservation, and no commitment to book. Dates are optional; if you add dates, include both check-in and checkout.</p>
    {error && <p role="alert" className="booking-alert">{error} <a href={contactHref}>Contact us directly</a>.</p>}
    <div className="booking-submit-row stay-submit-row">
      <button type="submit" className="button button-primary" disabled={sending}>{sending ? "Sending…" : "Send your question"}</button>
      <a href={contactHref} className="button button-secondary">Contact us directly</a>
    </div>
  </form>;
}
