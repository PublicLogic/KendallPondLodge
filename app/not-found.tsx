import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <p className="eyebrow">Page not found</p>
      <h1>Let’s get you back to the stay panel.</h1>
      <p>The page may have moved, but the house guide is still here.</p>
      <Link className="button button-primary" href="/">Return to KPL</Link>
    </main>
  );
}
