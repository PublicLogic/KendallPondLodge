import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/_components/Icons";
import { unlockOwner } from "./actions";

export const metadata: Metadata = {
  title: "Owner Login",
  description: "Owner and operator sign-in for the Lodge at Kendall Pond.",
  robots: { index: false, follow: false },
};

type OwnerAccessPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function OwnerAccessPage({ searchParams }: OwnerAccessPageProps) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/owner") ? params.next : "/owner";
  const hasError = params.error === "1";
  const hasConfigError = params.error === "config";

  return (
    <main id="main-content" className="guide-access-page">
      <section className="guide-access-card" aria-labelledby="owner-access-title">
        <span className="guide-access-mark icon-chip"><Icon name="shield" size={24} /></span>
        <p className="eyebrow">Owner sign-in</p>
        <h1 id="owner-access-title">Run the place.</h1>
        <p>Booking controls for Nate & Allie. Guests do not need this sign-in.</p>

        {hasError && <p className="guide-access-error" role="alert">That code did not match. Try again.</p>}
        {hasConfigError && <p className="guide-access-error" role="alert">Owner sign-in is temporarily unavailable due to a server configuration issue.</p>}

        <form className="guide-access-form" action={unlockOwner}>
          <input type="hidden" name="next" value={nextPath} />
          <label htmlFor="owner-code">Owner code</label>
          <input id="owner-code" name="code" type="password" autoComplete="off" minLength={6} maxLength={64} required placeholder="Enter owner code" />
          <button className="button button-primary" type="submit">Sign in <Icon name="arrow" size={18} /></button>
        </form>

        <p className="guide-access-boundary">Owner and operator tools only.</p>
        <p className="booking-guest-link"><Link href="/">Back to the lodge.</Link></p>
      </section>
    </main>
  );
}
