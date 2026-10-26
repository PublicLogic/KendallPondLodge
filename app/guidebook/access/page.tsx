import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/_components/Icons";
import { unlockGuidebook } from "./actions";

export const metadata: Metadata = {
  title: "Guidebook Access",
  description: "Enter the Lodge at Kendall Pond guest code to open the private Guidebook.",
  robots: { index: false, follow: false },
};

type AccessPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function GuidebookAccessPage({ searchParams }: AccessPageProps) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/guidebook") ? params.next : "/guidebook";
  const hasError = params.error === "1";
  const hasConfigError = params.error === "config";

  return (
    <main id="main-content" className="guide-access-page">
      <section className="guide-access-card" aria-labelledby="guide-access-title">
        <p className="eyebrow">Private guest experience</p>
        <h1 id="guide-access-title">Open the Guidebook.</h1>
        <p>Enter the guest code from your reservation to open the house guide.</p>

        {hasError && <p className="guide-access-error" role="alert">That code did not match. Check the reservation message and try again.</p>}
        {hasConfigError && <p className="guide-access-error" role="alert">The Guidebook is temporarily unavailable due to a server configuration issue. Please contact the hosts.</p>}

        <form className="guide-access-form" action={unlockGuidebook}>
          <input type="hidden" name="next" value={nextPath} />
          <label htmlFor="guidebook-code">Guest code</label>
          <input id="guidebook-code" name="code" type="password" autoComplete="one-time-code" autoCapitalize="characters" minLength={6} maxLength={32} required placeholder="Enter stay code" />
          <button className="button button-primary" type="submit">Open Guidebook <Icon name="arrow" size={18} /></button>
        </form>

        <p className="guide-access-boundary">This code opens guest guidance only.</p>
        <p className="booking-guest-link"><Link href="/">Not yet booked? Back to the lodge.</Link></p>
      </section>
    </main>
  );
}
