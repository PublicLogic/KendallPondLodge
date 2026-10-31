import Image from "next/image";
import Link from "next/link";

/** The public navigation uses the real Lodge mark and a readable wordmark.
 * Footer and guest-guide branding retain the existing full lockup.
 */
export function Brand({ header = false }: { header?: boolean }) {
  if (header) {
    return (
      <Link className="kpl-brand-image kpl-header-brand" href="/" aria-label="The Lodge at Kendall Pond — home">
        <Image
          src="/images/kpl/lodge-seal.png"
          alt=""
          width={512}
          height={512}
          sizes="(max-width: 760px) 48px, 58px"
          priority
          className="kpl-header-brand-mark"
          aria-hidden
        />
        <span className="kpl-header-brand-copy">
          <strong>The Lodge</strong>
          <span>at Kendall Pond</span>
          <small>by PublicLogic</small>
        </span>
      </Link>
    );
  }
  return (
    <Link className="kpl-brand-image" href="/" aria-label="The Lodge at Kendall Pond home">
      <Image
        src="/brand/kpl/lodge-by-publiclogic.png"
        alt="The Lodge at Kendall Pond · By PublicLogic"
        sizes="(max-width: 760px) 164px, 220px"
        width={1946}
        height={808}
        priority
        className="kpl-brand-lockup"
      />
      <Image
        src="/images/kpl/lodge-seal.png"
        alt=""
        width={512}
        height={512}
        sizes="48px"
        className="kpl-brand-seal-mobile"
        aria-hidden
      />
    </Link>
  );
}
