"use client";

import { useState } from "react";

export function QuoteLinkActions({
  path,
  email,
}: {
  path: string;
  email: string;
}) {
  const [copied, setCopied] = useState(false);

  const url =
    `https://kendallpondlodge.com${path}`;

  const subject =
    "Your Lodge at Kendall Pond quote";

  const body = [
    "Hi,",
    "",
    "Your private Lodge at Kendall Pond quote is ready:",
    url,
    "",
    "You can review the full price and terms before making the deposit.",
    "",
    "Nate & Allie",
  ].join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1800,
      );
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="owner-quote-actions">
      <button
        className="button button-primary"
        onClick={copy}
        type="button"
      >
        {copied ? "Copied" : "Copy quote link"}
      </button>

      <a
        className="button button-secondary"
        href={
          `mailto:${encodeURIComponent(email)}` +
          `?subject=${encodeURIComponent(subject)}` +
          `&body=${encodeURIComponent(body)}`
        }
      >
        Open email draft
      </a>

      <a
        className="owner-quote-open"
        href={path}
        rel="noreferrer"
        target="_blank"
      >
        Preview guest quote ↗
      </a>

      <small>
        Email delivery is still manual until PJ
        messaging is enabled.
      </small>
    </div>
  );
}
