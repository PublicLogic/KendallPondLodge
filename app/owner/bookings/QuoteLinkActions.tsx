"use client";

import { useState } from "react";
import { sendQuoteEmail } from "./actions";

export function QuoteLinkActions({
  id,
  path,
  deliveryStatus,
  providerAccepted,
  holdReason,
  messagingReady,
}: {
  id: string;
  path: string;
  deliveryStatus?: string | null;
  providerAccepted?: boolean;
  holdReason?: string | null;
  messagingReady: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const url = `https://kendallpondlodge.com${path}`;
  const sent = deliveryStatus === "sent" && providerAccepted === true;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="owner-quote-actions">
      {sent ? (
        <span className="owner-message-state owner-message-state-sent">
          ✓ Quote accepted by email provider
        </span>
      ) : (
        <form action={sendQuoteEmail}>
          <input name="id" type="hidden" value={id} />
          <button
            className="button button-primary"
            disabled={!messagingReady}
            type="submit"
          >
            Send quote
          </button>
        </form>
      )}

      <button
        className="button button-secondary"
        onClick={copy}
        type="button"
      >
        {copied ? "Copied" : "Copy link"}
      </button>

      <a
        className="owner-quote-open"
        href={path}
        rel="noreferrer"
        target="_blank"
      >
        Preview guest quote ↗
      </a>

      {!sent && !messagingReady && (
        <small>
          PJ email is held until an authorized sender and connected mail provider are ready.
        </small>
      )}

      {!sent && messagingReady && deliveryStatus === "held" && (
        <small>
          Delivery is held{holdReason ? `: ${holdReason}` : "."}
        </small>
      )}
    </div>
  );
}
