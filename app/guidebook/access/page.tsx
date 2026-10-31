import type { Metadata } from "next";
import Link from "next/link";

import { Brand } from "@/app/_components/Brand";
import { Icon } from "@/app/_components/Icons";

import { unlockGuidebook } from "./actions";

export const metadata: Metadata = {
  title: "Guidebook Access",
  description:
    "Enter the Lodge at Kendall Pond guest code to open the private Guidebook.",
  robots: { index: false, follow: false },
};

type AccessPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function GuidebookAccessPage({
  searchParams,
}: AccessPageProps) {
  const params = await searchParams;

  const nextPath =
    params.next?.startsWith("/guidebook")
      ? params.next
      : "/guidebook";

  const hasError = params.error === "1";
  const hasConfigError = params.error === "config";

  return (
    <main
      id="main-content"
      className="guide-access-page guide-access-fullscreen"
    >
      <section
        className="guide-access-card guide-access-card-app"
        aria-labelledby="guide-access-title"
      >
        <div className="guide-access-brand">
          <Brand />
        </div>

        <span className="guide-access-mark icon-chip">
          <Icon name="shield" size={22} />
        </span>

        <p className="eyebrow">
          Reserved for confirmed guests
        </p>

        <h1 id="guide-access-title">
          Your Lodge Guide.
        </h1>

        <p>
          Arrival, Wi-Fi, the hot tub, waterfront,
          house controls and checkout — all in one place.
        </p>

        {hasError && (
          <p
            className="guide-access-error"
            role="alert"
          >
            That code did not match. Check your
            reservation message and try again.
          </p>
        )}

        {hasConfigError && (
          <p
            className="guide-access-error"
            role="alert"
          >
            The Guidebook is temporarily unavailable.
            Please contact the hosts.
          </p>
        )}

        <form
          className="guide-access-form"
          action={unlockGuidebook}
        >
          <input
            type="hidden"
            name="next"
            value={nextPath}
          />

          <label htmlFor="guidebook-code">
            Guest code
          </label>

          <input
            id="guidebook-code"
            name="code"
            type="password"
            autoComplete="one-time-code"
            autoCapitalize="characters"
            minLength={6}
            maxLength={32}
            required
            placeholder="Enter stay code"
          />

          <button
            className="button button-primary"
            type="submit"
          >
            Open Guidebook
            <Icon name="arrow" size={18} />
          </button>
        </form>

        <p className="guide-access-boundary">
          Your guest code is in the reservation message we sent you.
        </p>

        <p className="booking-guest-link">
          <Link href="/">Back to the Lodge</Link>
        </p>
      </section>
    </main>
  );
}
