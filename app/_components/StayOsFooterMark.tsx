import Image from "next/image";
import styles from "./StayOsFooterMark.module.css";

type StayOsFooterMarkProps = {
  inverse?: boolean;
};

export function StayOsFooterMark({ inverse = false }: StayOsFooterMarkProps) {
  return (
    <div
      className={`${styles.mark}${inverse ? ` ${styles.inverse}` : ""}`}
      aria-label="Powered by PuddleJumper STAY"
      data-stayos-footer-mark
    >
      <span className={styles.label}>Powered by</span>
      <span className={styles.logo}>
        <Image
          src="/brand/stay/puddlejumper-beta.png"
          alt="PuddleJumper Beta"
          fill
          sizes="220px"
        />
      </span>
    </div>
  );
}
