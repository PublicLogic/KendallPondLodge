import Image from "next/image";
import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="The Lodge at Kendall Pond home">
      <Image className="brand-mark brand-seal" src="/images/kpl/lodge-seal.png" alt="The Lodge at Kendall Pond seal" width={72} height={72} priority />
      <span><strong>The Lodge</strong><small>at Kendall Pond</small></span>
    </Link>
  );
}
