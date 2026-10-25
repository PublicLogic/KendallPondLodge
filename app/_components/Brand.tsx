import Image from "next/image";
import Link from "next/link";

export function Brand() {
  return (
    <Link
      className="brand brand-kpl-lockup"
      href="/"
      aria-label="The Lodge at Kendall Pond home"
    >
      <Image
        className="brand-kpl-logo"
        src="/brand/kpl/lodge-by-publiclogic.png"
        alt="The Lodge at Kendall Pond · By PublicLogic"
        width={484}
        height={162}
        priority
      />
    </Link>
  );
}
