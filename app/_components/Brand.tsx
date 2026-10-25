import Image from "next/image";
import Link from "next/link";

export function Brand() {
  return (
    <Link className="kpl-brand-image" href="/" aria-label="The Lodge at Kendall Pond home">
      <Image
        src="/brand/kpl/lodge-by-publiclogic.png"
        alt="The Lodge at Kendall Pond · By PublicLogic"
        width={1946}
        height={808}
        priority
        className="kpl-brand-image-art"
      />
    </Link>
  );
}
