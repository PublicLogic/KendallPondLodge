import Image from "next/image";
import Link from "next/link";

export function Brand() {
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
