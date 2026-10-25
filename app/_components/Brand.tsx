import Link from "next/link";

export function Brand() {
  return (
    <Link className="kpl-wordmark" href="/" aria-label="The Lodge at Kendall Pond home">
      <span className="kpl-wordmark-top">The Lodge at</span>
      <span className="kpl-wordmark-main">Kendall Pond</span>
    </Link>
  );
}
